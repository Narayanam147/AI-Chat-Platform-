import { supabase } from './supabase';

export type HistoryEntry = {
	id: string;
	user_id: string | null;
	guest_session_id: string | null;
	prompt: string;
	response: string;
	is_deleted: boolean;
	created_at: string;
};

export type FetchHistoryOptions = {
	userId?: string | null;
	guestSessionId?: string | null;
	limit?: number;
	offset?: number;
};

export type HistoryError = {
	code: string;
	message: string;
};

export async function saveHistoryEntry({
	userId,
	guestSessionId,
	prompt,
	response,
}: {
	userId?: string | null;
	guestSessionId?: string | null;
	prompt: string;
	response: string;
}): Promise<{ data: HistoryEntry | null; error: HistoryError | null }> {
	try {
		if (!prompt?.trim() || !response?.trim()) {
			return {
				data: null,
				error: {
					code: 'INVALID_INPUT',
					message: 'Prompt and response cannot be empty',
				},
			};
		}

		const row = {
			user_id: userId ?? null,
			guest_session_id: guestSessionId ?? null,
			prompt: prompt.trim(),
			response: response.trim(),
			is_deleted: false,
			created_at: new Date().toISOString(),
		};

		const { data, error } = await supabase.from('chat_history').insert([row]).select().single();

		if (error) {
			return {
				data: null,
				error: {
					code: (error as any).code || 'DATABASE_ERROR',
					message: (error as any).message || 'Failed to save history',
				},
			};
		}

		return { data: data as HistoryEntry, error: null };
	} catch (err) {
		console.error('saveHistoryEntry error', err);
		return {
			data: null,
			error: {
				code: 'UNKNOWN_ERROR',
				message: err instanceof Error ? err.message : 'Unknown error occurred',
			},
		};
	}
}

export async function fetchHistoryForUser({
	userId,
	guestSessionId,
	limit = 50,
	offset = 0,
}: FetchHistoryOptions = {}): Promise<{
	data: HistoryEntry[] | null;
	error: HistoryError | null;
	total?: number;
}> {
	try {
		let query: any = supabase
			.from('chat_history')
			.select('*', { count: 'exact' })
			.eq('is_deleted', false)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (userId) {
			// Authenticated user - query by user_id
			query = query.eq('user_id', userId);
		} else if (guestSessionId) {
			// Guest with session - query by guest_session_id
			query = query.eq('guest_session_id', guestSessionId);
		} else {
			// No user or guest session
			query = query.is('user_id', null).is('guest_session_id', null);
		}

		const { data, error, count } = await query;

		if (error) {
			return {
				data: null,
				error: { code: (error as any).code || 'FETCH_ERROR', message: (error as any).message || 'Failed to fetch history' },
			};
		}

		return { data: (data || []) as HistoryEntry[], error: null, total: count || 0 };
	} catch (err) {
		console.error('fetchHistoryForUser error', err);
		return {
			data: null,
			error: { code: 'UNKNOWN_ERROR', message: err instanceof Error ? err.message : 'Unknown error occurred' },
		};
	}
}

export async function softDeleteHistory(id: string, userId?: string | null, guestSessionId?: string | null): Promise<{ data: HistoryEntry | null; error: HistoryError | null }> {
	try {
		if (!id?.trim()) {
			return { data: null, error: { code: 'INVALID_INPUT', message: 'History ID is required' } };
		}

		let builder: any = supabase.from('chat_history').update({ is_deleted: true }).eq('id', id);
		if (userId) {
			builder = builder.eq('user_id', userId);
		} else if (guestSessionId) {
			builder = builder.eq('guest_session_id', guestSessionId);
		} else {
			builder = builder.is('user_id', null).is('guest_session_id', null);
		}

		const { data, error } = await builder.select().single();

		if (error) {
			return { data: null, error: { code: (error as any).code || 'DELETE_ERROR', message: (error as any).message || 'Failed to delete history' } };
		}

		return { data: data as HistoryEntry, error: null };
	} catch (err) {
		console.error('softDeleteHistory error', err);
		return { data: null, error: { code: 'UNKNOWN_ERROR', message: err instanceof Error ? err.message : 'Unknown error occurred' } };
	}
}

const history = { saveHistoryEntry, fetchHistoryForUser, softDeleteHistory };
export default history;

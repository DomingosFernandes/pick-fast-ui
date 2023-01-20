
import type { Question } from '../../models/Game';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getQuestions } from '$lib/dbUtils';

export const load: PageServerLoad = async (): Promise<{ 
    question: Question,
    next: string,
}> => {

    const data = await getQuestions(1);
    
    if (data.length === 0) throw error(404, { message: 'Not found'});
    
    const nextDate = (new Date(data[0].datePlayed)).getTime();
    return {
        question: JSON.parse(JSON.stringify(data[0])),
        next: `/api/questions?dateplayed_lt=${nextDate}`
    }
};

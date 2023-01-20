import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { Question } from "../../../models/Game";
import { getQuestions } from "$lib/dbUtils";

export const GET = (async ({ url }) => {
    const dateplayed_lt = Number(url.searchParams.get('dateplayed_lt') ?? '0');

    //Simple timestamp validation
    if (dateplayed_lt === 0 || (new Date(dateplayed_lt)).getTime() > 0) {
        //TODO: limit may be specified in query params
        const questions: Array<Question> = await getQuestions(5, dateplayed_lt);

        if (questions.length === 0) return json({ data: { questions: [], next: null }});
        
        //There were some questions returned so we can query for more questions
        const nextDate = (new Date(questions[questions.length - 1].datePlayed)).getTime();

        return json({ 
            data: { questions, next: `/api/questions?dateplayed_lt=${nextDate}` }
        });
    }   
    return json({
        data: null, 
        message: 'No questions were found before specified date'
    });
}) satisfies RequestHandler;

import client from "$lib/mongo";
import type { Question } from "../models/Game";

export async function getQuestions(questionCount = 5, dateplayed_lt = 0): Promise<Array<Question>> {
    let filterOptions = {};
    
    if ( dateplayed_lt > 0 ) {
        filterOptions = { datePlayed: { $lt: new Date(dateplayed_lt)}}
    }
    
    const dbClient = await client;
    const pickFastDb = dbClient.db('pick_fast');
    const gameData = await pickFastDb.collection('game_data');

    const questions = await gameData
        .find(filterOptions, { sort:[['datePlayed', -1]]})
        .limit(questionCount)
        .toArray();

    return JSON.parse(JSON.stringify(questions));
}
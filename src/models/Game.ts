export type Player = {
    heroId: number,
    lane: string,
    role: string,
    position: number,
    isRadiant: boolean,
    name: string, 
    local: string,
    order: number
}

export type Question = {
    match_id: number,
    datePlayed: Date,
    radiantWin: boolean,
    lastPickRadiant: boolean,
    players: Array<Player>,
    answer: {
        position: number,
        lane: string,
        role: string,
        options: Array<{
            heroId: number,
            wasPicked: boolean,
            name: string,
            local: string,
        }>
    }
}

export type QuestionState = Question & {
    wasRoleAnswered?: boolean;
    roleSelected?: number;
    wasHeroAnswered?: boolean;
    heroSelected?: number;
}
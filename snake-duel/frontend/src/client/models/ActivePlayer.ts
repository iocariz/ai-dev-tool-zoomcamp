/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Direction } from './Direction';
import type { GameMode } from './GameMode';
import type { GameStatus } from './GameStatus';
import type { Position } from './Position';
export type ActivePlayer = {
    id?: string;
    username?: string;
    score?: number;
    mode?: GameMode;
    snake?: Array<Position>;
    food?: Position;
    direction?: Direction;
    status?: GameStatus;
};


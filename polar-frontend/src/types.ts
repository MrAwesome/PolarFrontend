export interface WorkoutRaw {
   starttime: string, 
}

export type WorkoutID = number;

export interface EverythingDataRaw {
    tags: any,
    equipment: any,
    sources: any,
    workouts: Record<WorkoutID, WorkoutRaw>,
}

export type DateByNumToWorkoutID = Record<number, Record<number, Record<number, Set<WorkoutID>>>>;
export type DateStrToWorkoutID = Record<string, Set<WorkoutID>>;

export interface EverythingData extends EverythingDataRaw {
    dateStrToWorkoutID: DateStrToWorkoutID,
    dateByNumToWorkoutID: DateByNumToWorkoutID,
}

export interface AppProps {}

export interface AppState {
    currentQuery?: string,
    lastAutocomplete?: string,
    lastSearch?: string,
    activeWorkout: WorkoutRaw | null,
    data: EverythingData | null,
}


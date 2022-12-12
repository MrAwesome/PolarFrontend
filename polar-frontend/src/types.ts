export interface WorkoutRaw {
   starttime: string, 
}

export type WorkoutID = string;
export type TagID = string;
export type TagIDNum = number;

export type TagType = string;


export interface EverythingDataRaw {
    tags: Record<TagID, TagRaw>,
    equipment: any,
    sources: any,
    workouts: Record<WorkoutID, WorkoutRaw>,
}

export interface EverythingData extends EverythingDataRaw {
    dateStrToWorkoutID: DateStrToWorkoutID,
    dateByNumToWorkoutID: DateByNumToWorkoutID,
    tagsByTagType: TagsByTagType,
}

export type DateByNumToWorkoutID = Record<number, Record<number, Record<number, Set<WorkoutID>>>>;
export type DateStrToWorkoutID = Record<string, Set<WorkoutID>>;

export type TagsByTagType = Record<TagType, Set<TagID>>;

export interface TagRaw {
  id: TagIDNum,
  name: string,
  tagtype: string,
}

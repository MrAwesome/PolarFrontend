export interface WorkoutRaw {
    id: number,
    starttime: string,
}

export type WorkoutID = string;

export type TagID = string;
export type TagIDNum = number;
export type TagType = string;
export type TagName = string;

export type EquipmentID = string;
export type EquipmentIDNum = number;
export type EquipmentType = string;


export interface EverythingDataRaw {
    tags: Record<TagID, TagRaw>,
    equipment: Record<EquipmentID, EquipmentRaw>,
    sources: any,
    workouts: Record<WorkoutID, WorkoutRaw>,
}

export interface EverythingData extends EverythingDataRaw {
    dateStrToWorkoutID: DateStrToWorkoutID,
    dateByNumToWorkoutID: DateByNumToWorkoutID,
    tagsByTagType: TagsByTagType,
    equipmentByEquipmentType: EquipmentByEquipmentType,
}

export type DateByNumToWorkoutID = Record<number, Record<number, Record<number, Set<WorkoutID>>>>;
export type DateStrToWorkoutID = Record<string, Set<WorkoutID>>;

export type TagsByTagType = Record<TagType, Set<TagID>>;
export type EquipmentByEquipmentType = Record<EquipmentType, Set<EquipmentID>>;

export interface TagRaw {
    id: TagIDNum,
    name: string,
    tagtype: string,
}

export interface EquipmentRaw {
    id: EquipmentIDNum,
    equipmenttype: EquipmentID,
    magnitude: number,
    quantity: number,
}

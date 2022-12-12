import {DateByNumToWorkoutID, DateStrToWorkoutID, EquipmentByEquipmentType, EverythingData, EverythingDataRaw, TagsByTagType} from "./types";
import {stringTimeToYMD} from "./utils";

export class DataParser {
    constructor(
        private dataRaw: EverythingDataRaw
    ) {
        this.parse = this.parse.bind(this);
        this.indexWorkoutsByDate = this.indexWorkoutsByDate.bind(this);
        this.indexTagsByTagType = this.indexTagsByTagType.bind(this);
    }

    parse(): EverythingData {
        const {dataRaw} = this;
        const {dateStrToWorkoutID, dateByNumToWorkoutID} = this.indexWorkoutsByDate();
        const {tagsByTagType} = this.indexTagsByTagType();
        const {equipmentByEquipmentType} = this.indexEquipmentByEquipmentType();

        const data = {...dataRaw, dateStrToWorkoutID, dateByNumToWorkoutID, tagsByTagType, equipmentByEquipmentType};
        return data
    }

    private indexTagsByTagType() {
        const tagsByTagType: TagsByTagType = {};
        const {dataRaw} = this;
        const {tags} = dataRaw;

        Object.values(tags).forEach(({tagtype, name}) => {
            if (!(tagtype in tagsByTagType)) {
                tagsByTagType[tagtype] = new Set();
            }
            tagsByTagType[tagtype].add(name);
        });

        return {tagsByTagType};
    }

    private indexEquipmentByEquipmentType() {
        const equipmentByEquipmentType: EquipmentByEquipmentType = {};
        const {dataRaw} = this;
        const {equipment} = dataRaw;

        Object.values(equipment).forEach(({equipmenttype, magnitude, quantity}) => {
            if (!(equipmenttype in equipmentByEquipmentType)) {
                equipmentByEquipmentType[equipmenttype] = new Set();
            }
            const displayName = `${equipmenttype}-${magnitude}-${quantity}`;
            equipmentByEquipmentType[equipmenttype].add(displayName);
        });

        return {equipmentByEquipmentType};
    }

    private indexWorkoutsByDate() {
        const {dataRaw} = this;
        const dateStrToWorkoutID: DateStrToWorkoutID = {};
        const dateByNumToWorkoutID: DateByNumToWorkoutID = {};

        // Load maps of dates to workouts
        Object.entries(dataRaw.workouts).forEach(([workoutID, workout]) => {
            // TODO: figure out why these keys are being cast to strings
            //const workoutID = parseInt(strWorkoutID);
            const dateStr = stringTimeToYMD(workout.starttime);

            if (!(dateStr in dateStrToWorkoutID)) {
                dateStrToWorkoutID[dateStr] = new Set();
            }
            dateStrToWorkoutID[dateStr].add(workoutID);

            const [year, month, day] = dateStr.split("-").map(x => parseInt(x));
            if (!(year in dateByNumToWorkoutID)) {
                dateByNumToWorkoutID[year] = {};
            }
            if (!(month in dateByNumToWorkoutID[year])) {
                dateByNumToWorkoutID[year][month] = {};
            }
            if (!(day in dateByNumToWorkoutID[year][month])) {
                dateByNumToWorkoutID[year][month][day] = new Set();
            }
            dateByNumToWorkoutID[year][month][day].add(workoutID);
        });

        return {dateStrToWorkoutID, dateByNumToWorkoutID};
    }
}


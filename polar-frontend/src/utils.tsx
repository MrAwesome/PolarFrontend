import {DateByNumToWorkoutID} from "./types";

// Replace the very odd behavior of javascript's default modulo function.
export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

const RUNNING_IN_JEST = process.env.JEST_WORKER_ID !== undefined;
export function runningInJest() {
    return RUNNING_IN_JEST;
}

export function runningInProduction() {
    return process.env.NODE_ENV === "production";
}

export function setTimeoutButNotInProdOrTests() {
    return (runningInJest() || runningInProduction())
        ? (f: () => void) => f()
        : setTimeout;
}

export function stringTimeToYMD(stringTime: string) {
    return stringTime.slice(0, 10);
}

export function debugDump(obj: Object) {
    let recursionDepth = 0;
    const maxDepth = 5;

    function fmap(arr: any, depth: number) {
        return arr.flatMap((x: any) => ["-".repeat(depth * 4), x, <br />]);
    }

    function ddHelper(o: any, depth: number): any {
        if (o === undefined || o === null) {
            return o;
        } else if (typeof o === "string") {
            return o;
        } else if (typeof o === "number") {
            return o;
        } else if (Array.isArray(o)) {
            if (o.length === 0) {
                return "[]";
            } else if (typeof o[0] === "string" || typeof o[0] === "number") {
                return o.join(", ");
            }
        }

        // At this point, we can be pretty sure it's an object, or an array of objects
        if (recursionDepth > maxDepth) {
            return o.toString();
        } else {
            const newDepth = depth + 1;
            const lawl = Array.from(Object.entries(o).map(([key, val]) => ([key, ":", "\u00a0".repeat(2), ddHelper(val, newDepth)])));
            const indented = fmap(lawl, newDepth);
            const first = indented.shift();
            indented.unshift(first);
            indented.unshift(<br />);
            return indented;
        }
    }

    return ddHelper(obj, -1);
}

export function getWorkoutIDsByDate(date: Date, dateByNumToWorkoutID: DateByNumToWorkoutID) {
    const [year, month, day] = getDateTriad(date);
    const workoutIDs = Array.from(dateByNumToWorkoutID[year]?.[month]?.[day] ?? []);
    return workoutIDs;
}

// NOTE: getMonth and getDate both return 0-indexed values, so we bump them here
export function getDateTriad(date: Date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate() + 1]
}

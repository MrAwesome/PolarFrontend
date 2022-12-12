import * as React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {DateByNumToWorkoutID, WorkoutID} from './types';
import {getWorkoutIDsByDate, mod} from './utils';


interface MonthlyCalendarProps {
    dateByNumToWorkoutID: DateByNumToWorkoutID,
    loadWorkout: (id: WorkoutID) => void,
}

interface MonthlyCalendarState {
    date: Date;
    lastClickedDate?: Date;
    lastClickedDateIndex?: number;
}

export default class MonthlyCalendar extends React.Component<MonthlyCalendarProps, MonthlyCalendarState> {
    buttonLock: boolean = false;

    constructor(props: MonthlyCalendarProps) {
        super(props);
        this.state = {
            date: new Date()
        };

        this.tileContent = this.tileContent.bind(this);
    }

    onChange = (date: Date) => {
        this.setState({date});
    }

    tileContent(
        args: {activeStartDate: Date, date: Date, view: string}
    ) {
        const {loadWorkout, dateByNumToWorkoutID} = this.props;
        const {date} = args;

        const workoutIDs = getWorkoutIDsByDate(date, dateByNumToWorkoutID);
        const idLinks = workoutIDs.map((id) =>
            <button onClick={(_e) => {
                this.buttonLock = true;
                setTimeout(() => this.buttonLock = false, 10);
                this.setState({lastClickedDate: date, lastClickedDateIndex: workoutIDs.indexOf(id)});
                return loadWorkout(id);
            }
            }>
                {id}
            </button>)

        return <div className="day-workouts-list">{idLinks}</div>
    }

    render() {
        return (
            <Calendar
                onClickDay={(date: Date, _event: any) => {
                    if (this.buttonLock === true) {return;}
                    const {lastClickedDate, lastClickedDateIndex} = this.state;
                    const {loadWorkout, dateByNumToWorkoutID} = this.props;

                    const workoutIDs = getWorkoutIDsByDate(date, dateByNumToWorkoutID);

                    // No workouts found for this date
                    if (workoutIDs.length === 0) {
                        return;
                    }

                    if (lastClickedDate !== undefined && lastClickedDateIndex !== undefined) {
                        // We've clicked the same date, so just go to the next workout on that date
                        if (lastClickedDate.toDateString() === date.toDateString()) {
                            const newIndex = mod(lastClickedDateIndex + 1, workoutIDs.length)

                            this.setState({lastClickedDateIndex: newIndex});
                            loadWorkout(workoutIDs[newIndex]);

                            return;
                        }
                    }

                    loadWorkout(workoutIDs[0]);
                    this.setState({lastClickedDate: date, lastClickedDateIndex: 0});

                }}
                onChange={this.onChange}
                value={this.state.date}
                tileContent={this.tileContent}
                view="month"
            />
        );
    }
}


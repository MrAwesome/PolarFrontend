import * as React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {DateByNumToWorkoutID} from './types';


interface MonthlyCalendarProps {
    dateByNumToWorkoutID: DateByNumToWorkoutID,
    loadWorkout: (id: number) => void,
}

interface MonthlyCalendarState {
    date: Date;
}

export default class MonthlyCalendar extends React.Component<MonthlyCalendarProps, MonthlyCalendarState> {
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
        const {loadWorkout} = this.props;
        const {date} = args;
        const dbynum = this.props.dateByNumToWorkoutID;

        // NOTE: getMonth and getDate both return 0-indexed values
        const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate() + 1];

        const workoutIDs = Array.from(dbynum[year]?.[month]?.[day] ?? []);

        const idLinks = workoutIDs.map((id) => <button onClick={() => loadWorkout(id)}>{id}</button>)

        return <div className="day-workouts-list">{idLinks}</div>
    }

    render() {
        return (
            <Calendar
                onChange={this.onChange}
                value={this.state.date}
                tileContent={this.tileContent}
                view="month"
            />
        );
    }
}

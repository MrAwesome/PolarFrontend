import * as React from 'react';

import MonthlyCalendar from "./MonthlyCalendar";

import './App.css';
import {debugDump, setTimeoutButNotInProdOrTests, stringTimeToYMD} from './utils';
import {AppProps, AppState, DateByNumToWorkoutID, DateStrToWorkoutID, EverythingData, EverythingDataRaw, WorkoutID} from './types';

class App extends React.Component<AppProps, AppState> {
    textInput: React.RefObject<HTMLInputElement> = React.createRef();
    currentMountAttempt = 0;

    constructor(props: any) {
        super(props);

        this.state = {data: null, activeWorkout: null}

        this.autoComplete = this.autoComplete.bind(this);
        this.getCalendar = this.getCalendar.bind(this);
        this.getSearchBar = this.getSearchBar.bind(this);
        this.loadData = this.loadData.bind(this);
        this.loadWorkout = this.loadWorkout.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        this.textInput.current?.focus();

        const existingQuery = this.textInput.current?.value;
        this.setState({currentQuery: existingQuery});

        const savedMountAttempt = this.currentMountAttempt;

        const protecc = setTimeoutButNotInProdOrTests();
        const msToWaitInDevMode = 10;
            
        // Wait for check that this is actually the final mount attempt
        protecc(async () => {
            if (this.currentMountAttempt === savedMountAttempt) {
                this.loadData();
            } else {
                console.warn("Detected double-mount, not fetching data...");
            }   
        }, msToWaitInDevMode);


        if (existingQuery !== undefined) {
            this.autoComplete();
        }
    }

    componentWillUnmount() {
        this.currentMountAttempt += 1;
    }

    async loadData() {
        const resp = await fetch("everything.json");
        const rawData = await resp.json();

        // TODO: better type checking later
        if (! ("workouts" in rawData)) {
            console.error("Data format is incorrect!");
            console.info(rawData);
        } else {
            const data = parseData(rawData);
            console.log(data);
            //@ts-ignore
            window.data = data;
            this.setState({data});
        }
    }

    autoComplete() {
        const {currentQuery} = this.state;
        //console.log("Autocomplete for: ", currentQuery);
        this.setState({lastAutocomplete: currentQuery});
    }

    search() {
        const {currentQuery} = this.state;
        //console.log("Searched for: ", currentQuery);
        this.setState({lastSearch: currentQuery});
    }


    onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const {currentQuery} = this.state;
        const curVal = this.textInput.current?.value;
        if (curVal !== undefined && currentQuery !== curVal) {
            this.setState({currentQuery: curVal}, this.search);
        } else {
            this.search();
        }
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const query = e.target.value;
        this.setState({currentQuery: query}, this.autoComplete);
    }

    getSearchBar() {
        const {lastAutocomplete, lastSearch} = this.state;
        return <div className="polar-search">
            <form onSubmit={this.onSubmit} autoComplete="off" >
                <input
                    autoFocus
                    placeholder="Search..."
                    type="text"
                    autoComplete="off"
                    onChange={this.onChange}
                    ref={this.textInput}
                />
                <button className="search-button" type="submit">Search</button>
            </form>

            <div className="main-divider"></div>

            <div className="last-autocomplete">Last autocomplete: <span className="last-autocomplete-text">"{lastAutocomplete}"</span></div>
            <br />
            <div className="last-search">Last search: <span className="last-search-text">"{lastSearch}"</span></div>
        </div>
    }

    getCalendar() {
        const {data} = this.state;
        const dbynum = data?.dateByNumToWorkoutID ?? null;
        const cal = dbynum !== null
            ? <MonthlyCalendar dateByNumToWorkoutID={dbynum} loadWorkout={this.loadWorkout} />
            : null;
        return <div className="polar-calendar">
                {cal}
            </div>
    }

    loadWorkout(id: WorkoutID) {
        const {data} = this.state;
        const workouts = data?.workouts;

        if (workouts !== undefined) {
            const workout = workouts[id];
            if (workout !== undefined) {
                this.setState({activeWorkout: workout});
            }
        }
    }

    getActiveWorkout() {
        const {activeWorkout} = this.state;
        if (activeWorkout !== null) {
            const workoutText = debugDump(activeWorkout);
            return <div className="active-workout">{workoutText}</div>
        }
    }

    render() {
        return (
            <div className="App">
                {this.getSearchBar()}
                <div className="cal-and-active">
                    {this.getCalendar()}
                    {this.getActiveWorkout()}
                </div>
            </div>
        );
    }
}
export default App;

function parseData(dataRaw: EverythingDataRaw): EverythingData {
    const dateStrToWorkoutID: DateStrToWorkoutID = {};
    const dateByNumToWorkoutID: DateByNumToWorkoutID = {};

    Object.entries(dataRaw.workouts).forEach(([strWorkoutID, workout]) => {
        // TODO: figure out why these keys are being cast to strings
        const workoutID = parseInt(strWorkoutID);
        const dateStr = stringTimeToYMD(workout.starttime);

        if (! (dateStr in dateStrToWorkoutID)) {
            dateStrToWorkoutID[dateStr] = new Set();
        }
        dateStrToWorkoutID[dateStr].add(workoutID);

        const [year, month, day] = dateStr.split("-").map(x => parseInt(x));
        if (! (year in dateByNumToWorkoutID)) { 
            dateByNumToWorkoutID[year] = {};
        }
        if (! (month in dateByNumToWorkoutID[year])) { 
            dateByNumToWorkoutID[year][month] = {};
        }
        if (! (day in dateByNumToWorkoutID[year][month])) { 
            dateByNumToWorkoutID[year][month][day] = new Set();
        }
        dateByNumToWorkoutID[year][month][day].add(workoutID);
    });

    const data = {...dataRaw, dateStrToWorkoutID, dateByNumToWorkoutID};
    return data
}

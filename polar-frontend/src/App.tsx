import * as React from 'react';

import MonthlyCalendar from "./MonthlyCalendar";

import './App.css';
import {debugDump, setTimeoutButNotInProdOrTests} from './utils';
import {EverythingData, TagType, WorkoutID, WorkoutRaw} from './types';
import {DataParser} from './DataParser';

// Search:
//  [] When you load a particular workout via search or not-by-the-calendar, select that year/month/day on the calendar
//  [] Collect and index tags, tag types, 
//  [] To search: tags by name, tags by tag type (show clickable list), sources by workout type, 
//
//
//
//  [] Show youtube preview

export interface AppProps {}

export interface AppState {
    currentQuery: string,
    lastAutocomplete?: string,
    lastSearch?: string,
    activeWorkout: WorkoutRaw | null,
    data: EverythingData | null,
    results: {tagTypes: TagType[]} | null,
}

class App extends React.Component<AppProps, AppState> {
    textInput: React.RefObject<HTMLInputElement> = React.createRef();
    currentMountAttempt = 0;

    constructor(props: any) {
        super(props);

        this.state = {currentQuery: "", data: null, activeWorkout: null, results: null}

        this.autoComplete = this.autoComplete.bind(this);
        this.getCalendar = this.getCalendar.bind(this);
        this.getSearchBar = this.getSearchBar.bind(this);
        this.loadData = this.loadData.bind(this);
        this.parseData = this.parseData.bind(this);
        this.loadWorkout = this.loadWorkout.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        this.textInput.current?.focus();

        const existingQuery = this.textInput.current?.value ?? "";
        this.setState({currentQuery: existingQuery});

        const savedMountAttempt = this.currentMountAttempt;

        const protecc = setTimeoutButNotInProdOrTests();
        const msToWaitInDevMode = 10;

        // Wait for check that this is actually the final mount attempt
        protecc(async () => {
            if (this.currentMountAttempt === savedMountAttempt) {
                this.loadData().then(this.parseData);

                if (existingQuery !== undefined) {
                    this.autoComplete();
                }
            } else {
                console.warn("Detected double-mount, not fetching data...");
            }
        }, msToWaitInDevMode);
    }

    componentWillUnmount() {
        this.currentMountAttempt += 1;
    }

    async loadData() {
        const resp = await fetch("everything.json");
        const rawData = await resp.json();

        return rawData;
    }

    parseData(rawData: any) {
        // TODO: better type checking later
        if (!("workouts" in rawData)) {
            console.error("Data format is incorrect!");
            console.info(rawData);
            return;
        }

        const parser = new DataParser(rawData);
        const data = parser.parse();

        // Debugging
        console.log(data);
        //@ts-ignore
        window.data = data;

        this.setState({data}, this.autoComplete);
    }

    autoComplete() {
        const {currentQuery, data} = this.state;

        this.setState({lastAutocomplete: currentQuery});

        if (data === null || currentQuery === undefined) {
            return;
        }
        const {tagsByTagType} = data;

        const tagTypes = Object.keys(tagsByTagType)
            .map((tag) => tag.toLowerCase())
            .filter((tag) => tag.startsWith(currentQuery))
            .map((tag) => tag.toUpperCase());

        this.setState({results: {tagTypes}});
    }

    search() {
        const {currentQuery} = this.state;
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
        const {lastAutocomplete, lastSearch, results} = this.state;
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

            <div className="last-autocomplete">
                Last autocomplete: <span className="last-autocomplete-text">"{lastAutocomplete}"</span>
            </div>
            <br />
            <div className="last-search">
                Last search: <span className="last-search-text">"{lastSearch}"</span>
            </div>

            <div className="results-debug">
                Tag Types: {results?.tagTypes.map((tagType) => 
                    <button className="tagtype-button">{tagType}</button>)}
            </div>
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

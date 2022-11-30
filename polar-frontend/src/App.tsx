import * as React from 'react';
import './App.css';

interface AppProps {}

interface AppState {
    currentQuery?: string,
    lastAutocomplete?: string,
    lastSearch?: string,
}

class App extends React.Component<AppProps, AppState> {
    textInput: React.RefObject<HTMLInputElement> = React.createRef();

    constructor(props: any) {
        super(props);

        this.state = {}

        this.autoComplete = this.autoComplete.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        this.textInput.current?.focus();

        const existingQuery = this.textInput.current?.value;
        this.setState({currentQuery: existingQuery});

        if (existingQuery !== undefined) {
            this.autoComplete();
        }
    }

    autoComplete() {
        const {currentQuery} = this.state;
        console.log("Autocomplete for: ", currentQuery);
        this.setState({lastAutocomplete: currentQuery});
    }

    search() {
        const {currentQuery} = this.state;
        console.log("Searched for: ", currentQuery);
        this.setState({lastSearch: currentQuery});
    }


    onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const currentQuery = this.state;
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


    render() {
        const {lastAutocomplete, lastSearch} = this.state;
        return (
            <div className="App">
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
        );
    }
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import { ajax, when } from 'jquery';
import { 
    BrowserRouter as Router, 
    Route, Link } from 'react-router-dom';

var config = {
        apiKey: "AIzaSyBaU7FzkMZc0fmWI0FDfJ_aDFm95Uuy8EE",
        authDomain: "movielistgenerator-app.firebaseapp.com",
        databaseURL: "https://movielistgenerator-app.firebaseio.com",
        projectId: "movielistgenerator-app",
        storageBucket: "movielistgenerator-app.appspot.com",
        messagingSenderId: "1048702965660"
      };

firebase.initializeApp(config);
const dbRef = firebase.database().ref('/movies');

//Create mood buttons component to show mood buttons on a new page
class MoodButtons extends React.Component {
    constructor() {
        super();
        this.state = {
            movies: [],
            selectedGenre: '',
            filteredGenre: []
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }
    handleChange(event) {
        //log out the value of the button that i clicked
       var moodValue = event.target.value;

       this.setState({
        selectedGenre: event.target.value
       })
    }

    componentDidMount() {
        // write a for loop where var x = the number of pages you want to request e.g three pages would be for (var x = 0 x < 2)
        const moviePages = [];
        for(var i = 1; i < 4; i++) {
        // inside of the for loop you will make your ajax request but for the 'page' parameter you will put x
            const requestPage = ajax({
                url: `https://api.themoviedb.org/3/discover/movie`,
                data: {
                    api_key: `f012df5d63927931e82fe659a8aaa3ac`,
                    language: `en-US`,
                    include_adult: `false`,
                    include_video: `false`,
                    page: i,
                    video: `true`
                }
            });
        // push each ajax request into an array               
            moviePages.push(requestPage);
        }

        // this will be an array of promises
        // [promise1, promise2, promise3]
        // use $.when to wait for all promises to come back with all movie data
        when(...moviePages)
        // when promises come back use the .then method to grab all the results from all the pages
            .then((...results) => {
                let mergedMovies = [];
                const finalResults = results.map(result => result[0]);
                console.log(finalResults)
                finalResults.forEach((page) => {
                    const pageResults = page.results;
                    mergedMovies = [...mergedMovies, ...pageResults]
                });
                // store those in the state
                this.setState({
                    movies: mergedMovies,
                }); 
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        //grab the entire movie list
        const movies = this.state.movies;
        //and grab the genre id that was selected
        const selectedGenre = this.state.selectedGenre;
        //loop over ours movies array
        const filteredMovies = movies.filter((item) => {
            return item.genre_ids.includes(parseInt(selectedGenre));
        });
        //store the filtered genres inside of a new state
        this.setState({
            filteredGenre: filteredMovies
        })
    }

    handleSave(movieItem) {
        // a function that saves selected movies to firebase
        dbRef.push(movieItem);
    }

    render() {
        return (
            <div className="formPart">
                <form onSubmit={this.handleSubmit}>
                    <div className="emojis">
                        <div className="goodMood">
                            <div className="excited">   
                                <img src="../public/styles/asset/excited.png"  alt="excited face"/>  
                                <div className="radio">  
                                    <label>excited</label>
                                    <input type="radio" name="mood" value="28" checked={this.state.selectedGenre === "28"} onChange={this.handleChange}/>
                                </div> 
                            </div>
                            <div className="peaceful">
                                <img src="../public/styles/asset/peaceful.png"  alt="peaceful face"/>
                                <div className="radio">  
                                    <label>peaceful</label>
                                    <input type="radio" name="mood" value="12" checked={this.state.selectedGenre === "12"} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="notBad">
                                <img src="../public/styles/asset/happy.png"  alt="not bad face"/>
                                <div className="radio"> 
                                    <label>not bad</label>
                                    <input type="radio" name="mood" value="16" checked={this.state.selectedGenre === "16"} onChange={this.handleChange}/>
                                </div>
                            </div>
                        </div>
                        <div className="badMood">
                            <div className="notGood">
                                <img src="../public/styles/asset/notGood.png"  alt="not good face"/> 
                                <div className="radio">
                                    <label>not good</label>
                                    <input type="radio" name="mood" value="35" onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="upset">
                                <img src="../public/styles/asset/upset.png"  alt="not good face"/> 
                                <div className="radio">
                                    <label>upset</label>
                                    <input type="radio" name="mood" value="10751"  onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div className="furious">
                                <img src="../public/styles/asset/furious.png"  alt="not good face"/> 
                                <div className="radio">
                                    <label>furious</label>
                                    <input type="radio" name="mood" value="10402" onChange={this.handleChange}/>
                                </div>
                            </div>
                        </div>
                    <input type="submit" className="submitButton"/>
                    </div>
                </form>
                <div className="moviesList">
                    {this.state.filteredGenre.map((movie) => {
                    return (
                        <div key={movie.id} className="singleMovie">
                            <img src={`http://image.tmdb.org/t/p/w500/${movie.poster_path}`}  alt=""/>
                            <div className="description">
                                <h2>{movie.title}</h2>
                                <h3>Vote Average: {movie.vote_average}</h3>
                                <h3>Release Date: {movie.release_date}</h3>
                                <button onClick={()=>this.handleSave(movie)}>Save</button> 
                            </div>         
                        </div>
                    )})}
                </div>
            </div>
        )
    }
}

class SavedMovies extends React.Component {
    constructor() {
        super();
        this.state={
            savedMovies:[]
        }
    }

    componentWillMount() {
        // a function that shows saved movies
        dbRef.on('value', (snapshot) => {
            console.log(snapshot);
            const savedMovies = snapshot.val();
            const movies=[]

            for (let item in savedMovies){
                movies.push(savedMovies[item]);
            }
            console.log(movies);
            this.setState({
                savedMovies:movies
            })
        });
    }

    render() {
        return (
            <div className="outerList">
                <div className="savedFilms">
                     {this.state.savedMovies.map((movies) => {
                        return(
                           <div key={movies.id} className="movieIds">
                                <img src={`http://image.tmdb.org/t/p/w500/${movies.poster_path}`}  alt=""/>
                                <h2>{movies.title}</h2>        
                           </div>
                        )
                     })}
                </div>
            </div>
        )
    }
}
           


// Create an app component to render everything 
class App extends React.Component {
    render() {
        return (
            <div>
                <div className="moodButtons">
                    <div className="emoji">
                        <MoodButtons />
                        <SavedMovies />
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
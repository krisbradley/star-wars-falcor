let jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $atom = jsonGraph.atom,
    axios = require('axios');

const baseUrl = "https://swapi.co/api/",
    filmsUrl = baseUrl + "films/",
    peopleUrl = baseUrl + "people/";

let Router = require('falcor-router'),
    ProductsRouter = Router.createClass([{
        route: 'films.length',
        get: pathSet => {
            return axios.get(filmsUrl).then(response => {
                return {
                    path: [pathSet[0], pathSet[1]],
                    value: response.data.count - 1 //the service doesn't return an index
                };
            });
        }
    }, {
        route: 'films[{integers:index}].id',
        get: pathSet => {
            return axios.get(filmsUrl).then(response => {
                return pathSet[1].map(index => {
                    return {
                        path: [pathSet[0], index, pathSet[2]],
                        value: response.data.results[index].episode_id
                    };
                });
            });
        }
    }, {
        route: 'films[{integers:index}].producer',
        get: pathSet => {
            return axios.get(filmsUrl).then(response => {
                return pathSet[1].map(index => {
                    return {
                        path: [pathSet[0], index, pathSet[2]],
                        value: $atom(response.data.results[index].producer.split(", "))
                    };
                });
            });
        }
    }, {
        route: "films[{integers:index}].title",
        get: pathSet => {
            return axios.get(filmsUrl).then(response => {
                return pathSet[1].map(index => {
                    return {
                        path: [pathSet[0], index, pathSet[2]],
                        value: response.data.results[index].title
                    };
                });
            });
        }
    }, {
        route: "films[{integers:index}].characters.length",
        get: pathSet => {
            return axios.get(filmsUrl).then(response => {
                return pathSet[1].map(index => {
                    return {
                        path: [pathSet[0], index, pathSet[2], pathSet[3]],
                        value: response.data.results[index].characters.length
                    }
                });
            });
        }
    }, {
        route: "films[{integers:index}].characters[{integers}]",
        get: pathSet => {
            return axios.get(filmsUrl).then(filmsResponse => {
                let falcorResponse = [];
                pathSet[1].forEach(filmsIndex => {
                    let characterUrlList = filmsResponse.data.results[filmsIndex].characters;
                    characterUrlList.forEach((characterLink, characterIndex) => {
                        let characterId = (parseInt(characterLink.replace(peopleUrl, "").replace("/", "")));
                        falcorResponse.push({
                            path: [pathSet[0], filmsIndex, pathSet[2], characterIndex],
                            value: $ref('charactersById[' + characterId + ']')
                        });
                    });
                });
                return falcorResponse;
            });
        }
    }, {
        route: "charactersById[{integers:id}].name",
        get: pathSet => {
            let falcorResponse = [];
            let promises = [];
            pathSet[1].forEach(id => {
                let personUrl = peopleUrl + (id);
                promises[id] = axios.get(personUrl);
            });
            return Promise.all(promises).then(responses => {
                responses.forEach((response, id) => {
                    if (response) {
                        falcorResponse.push({
                            path: [pathSet[0], id, pathSet[2]],
                            value: response.data.name
                        });
                    }
                });
                return falcorResponse;
            });
        }
    }]);

module.exports = ProductsRouter;
/* global google */
/* global $ */
(() => {
    'use strict';
    const mapper = google.maps;
    const infoWindow = new mapper.InfoWindow();



    async function fetchJson(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
        }
    };

    async function getMLB() {
        const gmap = new mapper.Map(document.getElementById('map'), {
            zoom: 4,
            center: { lat: 39, lng: - 97 },
            mapTypeId: mapper.MapTypeId.HYBRID
        });

        try {
            const MLB = await fetchJson('latlng.json');

            MLB.forEach(async team => {
                $('#sidebar').append(`<p><i id="${team.name}" class="bbclub-${team.name_abbrev} bb-5x"></i><br>${team.name.toUpperCase()}</p>`);

                let teaminfo = await getSummary();

                const marker = new mapper.Marker({
                    position: { lat: team.lat, lng: team.lng },
                    map: gmap,
                    title: `${team.team}`,
                    animation: mapper.Animation.DROP,
                    icon: {
                        url: `media/${team.name}-logo-black-and-white.png`,
                        scaledSize: new mapper.Size(40, 40)
                    },

                });

                $(`#${team.name}`).click(() => {
                    gmap.panTo(marker.position);
                    gmap.zoom = 18;
                });

                marker.addListener('click', () => {

                    //left this because couldnt find an api that would really have a better option for displaying info on stadiums
                    //so I just left them all for yankee stadium ... because at the end of the day we all know that the yanks own the MLB ;)
                    //in map2.js I used only one API but not so happy with the results
                    infoWindow.setContent(`${teaminfo[0].summary} <a href="${teaminfo[0].wiki}" target="_blank">read more<a/><img src="${teaminfo[0].pic}" height = "100px" width = "100px">`);
                    infoWindow.open(gmap, marker);
                });

            });

        } catch (er) {
            console.error(er, "what happened");
        }
    };
    
    async function getSummary() {
        try {
            const mlbteams = await fetchJson("http://api.geonames.org/wikipediaSearch?q=mlb%20stadiums&maxRows=30&username=dcams&type=json");


            let mlbteam = mlbteams.geonames.map(info => {
                return {
                    summary: info.summary,
                    lng: info.lng,
                    lat: info.lat,
                    title: info.title,
                    wiki: info.wikipediaUrl,
                    pic: info.thumbnailImg
                };
            });

            return mlbteam;
        } catch (er) {
            console.error(er, "what happened");
        }
    }

    getMLB();
})();
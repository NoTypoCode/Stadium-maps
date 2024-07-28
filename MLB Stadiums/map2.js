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
    }

    async function getMLB() {
        const gmap = new mapper.Map(document.getElementById('map'), {
            zoom: 4,
            center: { lat: 39, lng: - 97 },
            mapTypeId: mapper.MapTypeId.HYBRID
        });

        try {
            const MLB = await fetchJson("http://api.geonames.org/wikipediaSearch?q=mlb%20stadiums&maxRows=30&username=dcams&type=json");
            
            let mlbteam = MLB.geonames.map(info => {
                return {
                    summary: info.summary,
                    lng: info.lng,
                    lat: info.lat,
                    title: info.title,
                    wiki: info.wikipediaUrl,
                    pic: info.thumbnailImg,
                    rank: info.rank
                };
            });
            
            mlbteam.forEach(team => {
                $('#sidebar').append(`<p id="${team.rank}" ><br>${team.title.toUpperCase()}</p>`);

                const marker = new mapper.Marker({
                    position: { lat: team.lat, lng: team.lng },
                    map: gmap,
                    title: `${team.team}`,
                    animation: mapper.Animation.DROP,
                    icon: {
                        url: `${team.pic}`,
                        scaledSize: new mapper.Size(40, 40)
                    },

                });

                $(`#${team.rank}`).click(() => {
                    gmap.panTo(marker.position);
                    gmap.zoom = 18;
                });

                marker.addListener('click', () => {
                    infoWindow.setContent(`${team.summary} <a href="${team.wiki}" target="_blank">read more<a/><img src="${team.pic}" height = "100px" width = "100px">`);
                    infoWindow.open(gmap, marker);
                });

            });

        } catch (er) {
            console.error(er, "what happened");
        }
    }
    
    getMLB();
})();
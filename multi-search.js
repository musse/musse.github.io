moment.locale("pt-br");

var vm = new Vue({
    el: '#multi-search',
    data: {
        wordToSearch: "",
        searchedWords: parseSearches() || [],
        searchEngines: JSON.parse(localStorage.getItem('searchEngines')) || [],
    },
    watch: {
        searchedWords: function () {
            localStorage.setItem('searchedWords', JSON.stringify(this.searchedWords))
        },
        searchEngines: function () {
            localStorage.setItem('searchEngines', JSON.stringify(this.searchEngines))
        },
    },
    computed: {
        searchedWordsWithTime: function () {

        }
    },
    methods: {
        resetSearchList: function() {
            this.searchedWords = []
        },
        searchWord: function() {
            if (!this.wordToSearch || this.searchEngines.length == 0) {
                return;
            }
            q = this.wordToSearch
            if (document.getElementById("google").checked) {
                window.open("http://www.google.de/search?q=" + q + "&num=12&hl=de&tbo=d&site=imghp&tbm=isch&sout=1&biw=1075&bih=696");
            }
            if (document.getElementById("wiki").checked) {
                window.open("http://de.wiktionary.org/wiki/" + q);
            }
            if (document.getElementById("forvo").checked) {
                window.open("http://www.forvo.com/word/" + q + "/#de");
            }
            if (document.getElementById("leo").checked) {
                window.open("https://dict.leo.org/alem%C3%A3o-portugu%C3%AAs/" + q);
            }
            if (document.getElementById("duden").checked) {
                window.open("https://www.duden.de/suchen/dudenonline/" + q);
            }
            this.searchedWords = [{word: this.wordToSearch, time: moment()}, ...this.searchedWords]
            this.wordToSearch = ""
        }
    }
})

function parseSearches() {
    searches = JSON.parse(localStorage.getItem('searchedWords'))
    for(var i = 0; i < searches.length; i++) {
        searches[i].time = moment(searches[i].time);
    }
    return searches
}

$('.ui.checkbox')
.checkbox()
;

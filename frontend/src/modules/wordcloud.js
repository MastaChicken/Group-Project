import * as WordCloud from "wordcloud";

 
export default function makeWordCloud(list){
    WordCloud(document.getElementById('wordcloud'), { list: list } );
}

import * as WordCloud from "wordcloud";
import { $ } from "../constants";


export default function makeWordCloud(list){
    WordCloud($('wordcloud'), { list: list } );
}

export const extractValues = (obj:any, key:any) => {
    /*
        Parses the example sentence returned from dictionary api and replaces
        any {it}{/it} token to higlight the word in the sentence with <strong></strong> 
        html tags. Also returns a capitalized sentence.
    */
    let values:any = [];
    function extract(obj:any) {
        if (typeof obj === 'object' && obj !== null) {
            for (let k in obj) {
                if (obj.hasOwnProperty(k)) {
                    if (k === key) {
                        function transformAndCapitalize(sentence:string) {
                            let transformedSentence = sentence.replace(/\{it\}/g, '<strong>').replace(/\{\/it\}/g, '</strong>');
                            transformedSentence = transformedSentence.replace(/^(<strong>)([a-z])/, (match, p1, p2) => {
                                return p1 + p2.toUpperCase();
                            });
                            if (!transformedSentence.startsWith('<strong>')) {
                                transformedSentence = transformedSentence.charAt(0).toUpperCase() + transformedSentence.slice(1);
                            }
                            return transformedSentence;
                        }
                        
                        const exampleStr = transformAndCapitalize(obj[k])
                        values.push(exampleStr);
                    } else if (typeof obj[k] === 'object') {
                        extract(obj[k]);
                    }
                }
            }
        }
    }
    extract(obj);
    return values;
}


export const parseOpenAiInputToArray = (inputString:string) => {
    /*
        Open AI response returned in following format: "\n\n1. Book\n2. Chair\n3. Laptop\n4. Tree";
        Regular expression to find patterns of "n<number>." followed by any word
        This regex looks for line breaks followed by one or more digits, a dot, optional 
        spaces, and captures the word(s) following the dot

        Argument: String
        Returns: Array
    */
    const pattern = /\n(\d+)\.\s*([A-Za-z]+)/g;

    // Use match to find all matches in the inputString
    let matches = [...inputString.matchAll(pattern)];
  
    // Extract the words from the matches
    let words = matches.map(match => match[2]);
  
    return words;
}


export const isOver24Hours = (dateInMilliseconds:number) => {
    /* 
        Checks to make sure data that has been stored has been over 24 hours 
    */
    const currentTimeMilliseconds = Date.now();
    const timeDifferenceMilliseconds = currentTimeMilliseconds - dateInMilliseconds;
    // Convert milliseconds to hours
    const timeDifferenceHours = timeDifferenceMilliseconds / (1000 * 60 * 60); 
    return timeDifferenceHours > 24;
}


export const isOver5Minutes = (dateInMilliseconds:number) => {
    /* 
        Checks to make sure data that has been stored has been over 5 mins. 
        This is mostly just for testing.
    */
    const currentTimeMilliseconds = Date.now();
    const timeDifferenceMilliseconds = currentTimeMilliseconds - dateInMilliseconds;
    // Convert milliseconds to minutes
    const timeDifferenceMinutes = timeDifferenceMilliseconds / (1000 * 60);
    return timeDifferenceMinutes > 5;
}
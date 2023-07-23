const prompt = require("prompt-sync")({ sigint: true });

// regex expression that matches any number of consecutive repetition of the following characters: +, -, *, / and  stores the concatenation of repeated characters
const op_regex = /(\+|\-|\*|\/)+\1*/;
let operations = ["+", "-", "*", "/"];

let result = 0;

const replaceSigns = (expression) => {
    expression = expression.replace("++", "+");
    expression = expression.replace("+-", "-");
    expression = expression.replace("--", "+");
    expression = expression.replace("-+", "-");
    return expression;
}

const replaceMultipleOperationsWithLastOne = (expression) => {
    let dummy_expression = expression;
    while(true){
        const match = dummy_expression.match(op_regex);                
        if(!match) break;        
        if (match) {
            let string_to_replace = match[0];
            dummy_expression = dummy_expression.replace(string_to_replace, "");
            expression = expression.replace(string_to_replace, match[1]);            
        }
    }
    return expression;
}

const returnFirstOperationMatch = (expression, operation) => {
    let op1 = "";
    let op2 = "";
    let grabbing_first = true;    
    let found = false;
    for(let i = 0; i < expression.length; i++){
        // if it is a number or a point, save and continue        
        if(parseInt(expression[i]) || expression[i] === "0" || expression[i] == "."){
            if(grabbing_first) op1 += expression[i];
            else op2 += expression[i];
            continue; 
        } 
        if(operations.includes(expression[i])){            
            if(expression[i] === operation && grabbing_first){
                found = true;
                grabbing_first = false;
                continue;
            }

            if(grabbing_first){
                if(expression[i] != operation && expression[i] === "-" && op1 === ""){
                    op1 += expression[i];
                    continue;
                }                
                op1 = "";
                continue;
            }            

            if(!grabbing_first){
                break;
            }

        }
    }
    if(op1 == "") op1 = "0";
    if(op2 == "") op2 = "0";
    //console.log([op1+ operation +op2, op1, op2, expression]);
    return found ? [op1+ operation +op2, op1, op2, expression] : null;
    // [ '1+2.1+1', '1', '+', '2.1', '1+2.2+1+1']
}

const justAValue = (expression) => {
    let n_operations = {}
    for(let char of expression){
        if(operations.includes(char)){
            if(n_operations[char]) n_operations[char] += 1;
            else n_operations[char] = 1;
        }
    }
    if(expression[0] === "-" && n_operations["-"] === 1 && n_operations["+"] === undefined && n_operations["*"] === undefined && n_operations["/"] === undefined){
        return true;
    }
    if(expression[0] === "+" && n_operations["+"] === 1 && n_operations["-"] === undefined && n_operations["*"] === undefined && n_operations["/"] === undefined){
        return true;
    }
    return false;
}

const operationLoop = (expression, operation) => {    
    while(true){
        expression = replaceSigns(expression);
        const match = returnFirstOperationMatch(expression, operation);
        if (!match) break;
        // console.log(match);
        const [exp, a, b] = match;
        switch(operation){
            case "+":
                result = parseFloat(a) + parseFloat(b);
                break;
            case "-":            
                result = parseFloat(a) - parseFloat(b);
                break;
            case "*":
                result = parseFloat(a) * parseFloat(b);
                break;
            case "/":
                result = parseFloat(a) / parseFloat(b);
                break;
        }                

        expression = expression.replace(exp, result.toString());        
        // this can be a -2 or +2, so we need to break here, not continue doing substractions or adding
        if(justAValue(expression)) break;
        // if during operations we end up with a negative result, we just move that to the back so it will be done at the end and end up with a single value
        if(expression[0] === "-" && result < 0){
            expression = expression.replace(result.toString(), "");
            expression = expression + result.toString();
        }
    }
    return expression;
}

const checkIfC = (expression) => {
    if(expression.includes("c")){
        let index = expression.indexOf("c");
        expression = expression.slice(index + 1, expression.length);
        console.log(expression);
        result = 0;
    }
    return expression;
}

while(true){
    let expression = prompt("Introduce the operation: ");

    // in case the user changes the selection of the operation
    expression = replaceMultipleOperationsWithLastOne(expression);    
    expression = checkIfC(expression);

    const starts_with_op = operations.includes(expression[0]);
    if(starts_with_op) expression = result.toString() + expression; // concatenation of strings

    // console.log(expression);
    
    // multiplication
    expression = operationLoop(expression, "*");
    // division
    expression = operationLoop(expression, "/");        
    // substraction
    expression = operationLoop(expression, "-");        
    // addition
    expression = operationLoop(expression, "+");

    console.log(result);
}


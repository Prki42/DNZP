async function postData(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

const resetAllMath = () => {
    MathJax.typesetPromise().then(() => {
        document.querySelectorAll(".math-field").forEach(mathField => {
            mathField.innerHTML = '';
        });
        MathJax.typesetPromise();
    }).catch((err) => console.log(err.message));
}

function analyze() {
    let eqn = document.getElementById("eqn").value;
    let solveFor = document.getElementById("solve_for").value;
    postData("/api/solve", {
        eqn: eqn,
        solve_for: solveFor
    })
        .then(data => {
            console.log(data)
            if (data.error) {
                document.getElementById("error").classList.remove("hidden");
                resetAllMath();
                return;
            }
            document.getElementById("error").classList.add("hidden");
            MathJax.typesetPromise().then(() => {
                let func = 'f(' + solveFor + ')'
                document.getElementById("expr").innerHTML = '\\[' + func + '=' + data.expression + '\\]';
                document.getElementById("domain").innerHTML = '\\[D: ' + solveFor + '\\in' + data.domain + '\\]';
                document.getElementById("zeros").innerHTML = '\\[' + func + '= 0:\\quad ' + solveFor + '\\in' + data.zeros + '\\]';
                document.getElementById("positive").innerHTML = '\\[' + func + '>0:\\quad ' + solveFor + '\\in' + data.positive + '\\]'
                document.getElementById("negative").innerHTML = '\\[' + func + '<0:\\quad ' + solveFor + '\\in' + data.negative + '\\]'
                parity = document.getElementById("parity");
                if (data.is_even) {
                    parity.innerHTML = "Parna"
                }
                else if (data.is_odd) {
                    parity.innerHTML = "Neparna"
                }
                else {
                    parity.innerHTML = "Neodređene parnosti"
                }
                MathJax.typesetPromise();
            }).catch((err) => console.log(err.message));
        });
}
from flask import render_template, request, Blueprint
import sympy
from sympy.solvers import solveset
from sympy.calculus.util import continuous_domain


def analyze_function(fun: str, solve_for: str):
    result = {}
    empty_set = "\\emptyset"
    solve_for = sympy.Symbol(solve_for)
    expr = sympy.parse_expr(fun)
    expr = expr.simplify(trig=True)
    result["expression"] = sympy.latex(expr)

    domain = continuous_domain(expr, solve_for, sympy.S.Reals)

    if domain:
        result["zeros"] = sympy.latex(solveset(expr, solve_for, domain=domain))
        try:
            result["positive"] = sympy.latex(
                solveset(expr > 0, solve_for, domain=domain)
            )
        except Exception:
            result["positive"] = empty_set
        try:
            result["negative"] = sympy.latex(
                solveset(expr < 0, solve_for, domain=domain)
            )
        except Exception:
            result["negative"] = empty_set

        func = sympy.lambdify(solve_for, expr, modules="sympy")
        result["is_even"] = (
            sympy.simplify(
                sympy.expand(func(solve_for) - func(-solve_for), force=True)
            )
            == 0
        )
        result["is_odd"] = (
            sympy.simplify(
                sympy.expand(func(solve_for) + func(-solve_for), force=True)
            )
            == 0
        )
    else:
        result["zeros"] = empty_set
        result["positive"] = empty_set
        result["negative"] = empty_set
        result["is_even"] = empty_set
        result["is_odd"] = empty_set

    result["domain"] = sympy.latex(domain)

    return result


main = Blueprint("main", __name__)


@main.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@main.route("/api/solve", methods=["POST"])
def solve():
    data = request.json
    if not ("eqn" in data and "solve_for" in data):
        return {}, 400
    try:
        return analyze_function(data["eqn"], data["solve_for"])
    except Exception as e:
        return {"error": str(e)}, 500

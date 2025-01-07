from flask import Flask, request, jsonify

def add_number(a,b):
    return a+b

app=Flask(__name__)

@app.route('/add', methods=['GET'])
def add_number_api():
    a=request.args.get('a',type=int)
    b=request.args.get('b',type=int)
    result=add_number(a,b)
    return jsonify({'result':result})


if __name__=='__main__':
    app.run(debug=True)
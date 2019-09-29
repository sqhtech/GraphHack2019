from algorithm import *
import json
import os
from flask import Flask, jsonify, request,Response
os.environ['KMP_DUPLICATE_LIB_OK']='True'

app = Flask(__name__)


@app.route('/community_detect', methods=['POST','OPTIONS'])
def community_detection():

    if request.method == 'OPTIONS':
        return Response(headers = {
            'Access-Control-Allow-Headers':'X-Requested-With,content-type',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS'
            })

    d = request.get_json()

    G = json_to_graph(d)

    method = d['method']

    level = d.get('level')
    level = 2 if level is None else level

    if method == 'girvan_newman':
        result = girvan_newman(G)
        result = format_json_newman(result)

    elif method == 'modularity_maximization':
        result = partition_at_level(G,level,normalize = True,method = 'modularity_max',return_json = True)

    elif method == 'spectral_partition':
        result = partition_at_level(G,level,normalize = True,method = 'spectral',return_json = True)

    elif method == 'walktrap':
        result = walk_trap(G,level = level,return_json = True)

    elif method == 'louvain':
        result = louvain(G,return_json=True)

    elif method == 'lpa':
        result = label_propagation(G)

    elif method == 'graph_info':
        result = json.dumps(graph_statistics(G),ensure_ascii = False)
    else:
        result = None
        print("Bad algorithm type.")

    print(result)
    return Response(headers = {
    'Access-Control-Allow-Headers':'X-Requested-With,content-type',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS'
    },
    response = result)
    # return community

import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from numpy import linalg as LA
from itertools import combinations
from collections import Counter
from collections import defaultdict
from community import best_partition, modularity
from sklearn.metrics.pairwise import cosine_similarity
from scipy.cluster.hierarchy import linkage,dendrogram
from scipy.cluster.hierarchy import fcluster
import time
import json


def graph_statistics(G):
    diameter = nx.diameter(G)
    radius = nx.radius(G)

    n_nodes = len(G.nodes())
    n_edges = len(G.edges())

    degree_distribution = [{'node':int(node), 'degree':int(degree)} for node, degree in nx.degree(G)]
    degree_centrality_distribution = [{'node':int(node), 'degree_centrality':int(degree)} for node, degree in nx.degree_centrality(G).items()]
    betweenness_centrality_distribution = [{'node':int(node), 'betweenness_centrality':int(degree)} for node, degree in nx.betweenness_centrality(G).items()]
    closeness_centrality_distribution = [{'node':int(node), 'closeness_centrality':int(degree)} for node, degree in nx.closeness_centrality(G).items()]
    eigen_vector_centrality_distribution = [{'node':int(node), 'eigen_vector_centrality':int(degree)} for node, degree in nx.eigenvector_centrality(G).items()]

    graph_statistics = {'degree_distribution':degree_distribution,
     'degree_centrality_distribution':degree_centrality_distribution,
     'betweenness_centrality_distribution':betweenness_centrality_distribution,
     'closeness_centrality_distribution':closeness_centrality_distribution,
     'eigen_vector_centrality_distribution':eigen_vector_centrality_distribution,
     'diameter':diameter,
     'radius':radius,
     'n_nodes':n_nodes,
     'n_edges':n_edges
    }

    return graph_statistics


def girvan_newman(G):
    g = G.copy()

    # modularity history
    modus = []

    # connected_components
    cc = list(nx.connected_components(g))

    # calculate modularity
    modu = nx.community.quality.modularity(g,cc)
    modus.append(modu)

    # connected components - communities
    cc_hist = [[list(component)] for component in cc]

    # {modularity: nx graph} key value pairs
    graph_lookup = dict()

    # edge cut history
    cut_history = [(-1,-1)]

    for i in range(len(g.edges()) - 1):

        # calculate edge betweenness
        edge_betweenness = nx.edge_betweenness_centrality(g)

        # sort edge betweenness
        u,v = max(edge_betweenness,key = edge_betweenness.get)
        g.remove_edge(u,v)

        # connected components subgraph
        cc = [list(component) for component in nx.connected_components(g)]
        cc_hist.append(cc)
        cut_history.append((u,v))

        # calculate modularity
        modu = nx.community.quality.modularity(G,cc)
        modus.append(modu)


    return {
        'modularity_history':modus,
        'community_history':cc_hist,
        'cut_history':cut_history
    }




def spectral_partition(G,normalize = False):

    '''
        Desc: This function implement spectral partition on a graph
        Draw an image using networkx and matplotlib

        Params:
            G: a networkx graph
        Returns:
            partition results - numpy array

    '''
    # calculated node degrees, sort by node order
    ordered_degrees = np.array([deg for node, deg in sorted(list(G.degree()),key = lambda x:x[0])]).reshape((1,-1))

    # identity matrix
    eye = np.eye(len(G.nodes()))

    # adjacency matrix
    A = nx.adj_matrix(G).toarray()

    # degree matrix
    D = eye * ordered_degrees

    # incase of singular MATRIX
    for i in range(D.shape[0]):
        if D[i,i] ==0:
            D[i,i] = 1

    # laplacian matrix
    L = D - A
    assert A.shape == D.shape == L.shape

    if normalize:
        L = np.dot(LA.inv(D),L)

    # find eigen values and eigen vectors
    lambdas, vectors = LA.eig(L)

    # the second smallest eigen value and corresponding eigen vector
    second_smallest_ev = np.partition(lambdas, 1)[1]
    second_smallest_loc = np.where(lambdas == second_smallest_ev)[0][0]


    # retrieve sign of eigen vector elements
    x2 = vectors[:,second_smallest_loc]
    s2 = (x2 > 0).astype(int)
    s2[s2 ==0] = -1

    return s2


def modularity_maxization(G):

    # calculated node degrees, sort by node order
    k = np.array([deg for node, deg in sorted(list(G.degree()),key = lambda x:x[0])]).reshape((-1,1))
    m = len(G.edges())
    A = nx.adj_matrix(G).toarray()
    B = A - (1/(2*m)) * (np.dot(k,k.T))

    assert A.shape == B.shape

    # find eigen values and eigen vectors
    lambdas, vectors = LA.eig(B)


    max_lambda = np.max(lambdas)
    max_lambda_loc = np.where(lambdas == max_lambda)[0][0]


    # retrieve sign of eigen vector elements
    x1 = vectors[:,max_lambda_loc]
    s1 = (x1 > 0).astype(int)
    s1[s1 ==0] = -1

    return s1


def partition_at_level(G,level = 2,normalize = True,method = 'spectral',return_json = False):

    partitions = [list(G.nodes())]

    for level in range(level):
        new_partitions = []
        for partition in partitions:
            if len(partition) == 1:
                new_partitions.append(partition)
                continue
            T = G.subgraph(partition)

            try:
                if method =='spectral':
                    s2 = spectral_partition(T,normalize = normalize)

                elif method == 'modularity_max':
                    s2  = modularity_maxization(T)
                else:
                    raise ValueError
                partition1_nodes = np.array(T.nodes())[np.where(s2 ==1)[0].tolist()].tolist()
                partition2_nodes = np.array(T.nodes())[np.where(s2 ==-1)[0].tolist()].tolist()
                new_partitions.append(partition1_nodes)
                new_partitions.append(partition2_nodes)
            except:
                new_partitions.append(partition)

        partitions = new_partitions

    node_colors = {}
    for i,partition in enumerate(partitions):
        for node in partition:
            node_colors[node] = i
    community = [partition for node, partition in sorted(node_colors.items(),key = lambda x:x[0])]
    if return_json:
        return json.dumps([{'node':int(i),'community':int(comm)} for i,comm in enumerate(community)],ensure_ascii = False)
    else:
        return community


def label_propagation(G,max_iterations = 100,return_json = True):


    # initialized labels
    for n,d in G.nodes(data=True):
        d['community'] = n

    n_nodes = len(G.nodes())

    for i in range(max_iterations):

        # randomize node order
        node_sequence = np.random.permutation(list(G.nodes())).tolist()

        # assign label to all nodes
        altered_nodes = 0
        for node in node_sequence:
            neighbors = G.neighbors(node)

            # check if a nodes is not connected to any other nodes
            if not len(list(neighbors)) > 0:
                continue

            # reassign labels
            label = Counter([G.node[nei]['community'] for nei in G.neighbors(node)]).most_common()[0][0]
            if G.node[node]['community'] != label:
                G.node[node]['community'] = label
                altered_nodes += 1

        if altered_nodes ==0:
            break

    community = [d['community'] for n,d in G.nodes(data = True)]
    if return_json:
        return json.dumps([{'node':int(i),'community':int(comm)} for i,comm in enumerate(community)],ensure_ascii = False)
    else:
        return community


def louvain(G,return_json = True):
    community = [comm for node, comm in best_partition(G).items()]
    if return_json:
        return json.dumps([{'node':int(i),'community':int(comm)} for i,comm in enumerate(community)],ensure_ascii = False)
    else:
        return community


def random_walk_t_step(G,t = 3):
    degrees = [d for n, d in sorted(dict(nx.degree(G)).items(),key =lambda x:x[0])]
    D = np.eye(len(G.nodes))*degrees

    # incase of singular MATRIX
    for i in range(D.shape[0]):
        if D[i,i] ==0:
            D[i,i] = 1

    A = nx.adj_matrix(G).toarray()
    P = np.dot(np.linalg.inv(D),A)
    Pt = P.copy()
    for _ in range(t):
        Pt = np.dot(Pt,P)
    return Pt,D,A

def walk_trap(G,level = 4,return_json = False):
    # number of nodes in a graph
    n_nodes = len(G.nodes())

    # randomwalk t step
    Pt,D,A = random_walk_t_step(G,3)

    D_12 = np.sqrt(np.linalg.inv(D))

    # similarity matrix
    sim_mat = np.zeros((n_nodes,n_nodes))
    for i in range(n_nodes):
        for j in range(n_nodes):
            sim_ij = np.sqrt(np.square(np.dot(D_12,Pt[i,:]) - np.dot(D_12,Pt[j,:])).sum())
            sim_mat[i,j] = sim_ij

    mergeings = linkage(sim_mat,method = 'complete',metric = 'cosine')

    community = fcluster(mergeings, level,criterion = 'maxclust')
    if return_json:
        return json.dumps([{'node':int(i),'community':int(comm)} for i,comm in enumerate(community)],ensure_ascii = False)
    else:
        return community


def read_data():
    with open('graph.txt','r') as f:
        j_str = f.read()
    return json_to_graph(j_str)



def json_to_graph(d):
    # d = json.loads(j_str)
    num_nodes = d['num_nodes']
    edge_list =  [(edge['source'],edge['target']) for edge in d['edges']]
    T = nx.Graph()
    T.add_nodes_from(np.arange(num_nodes))
    for u,v in edge_list:
        T.add_edge(u,v)
    return T


def format_json_newman(result):
    history = []
    for iters,cc in enumerate(result['community_history']):

        print("Iterations: {}".format(iters))
        assignment = []
        for i,comm in enumerate(cc):
            for node in comm:
                assignment.append({'node':int(node),'community':int(i)})

        try:
            edge = result['cut_history'][iters]
            u,v = edge[0],edge[1]
            modularity = result['modularity_history'][iters]
        except:
            u,v = -1,-1
            modularity = -1

        history.append({
            'iteration':iters,
            'communities':assignment,
            'cut':{'source':int(u),'target':int(v)},
            'modularity':modularity
        })

    return json.dumps(history,ensure_ascii = False)

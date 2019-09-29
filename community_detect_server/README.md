# Installation Guide

## Create virtual environment
conda create -n py3 python=3.7 anaconda
source activate py3


## Install dependencies

pip install gunicorn
pip install -r requirements.txt



## Start service
gunicorn --bind 0.0.0.0:5000 server:app --timeout=1000



import streamlit as st
import yaml

with open("keys.yaml") as f:
    keys = yaml.load(f, Loader=yaml.FullLoader)
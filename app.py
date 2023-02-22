import pandas as pd
import streamlit as st
from st_clickable_images import clickable_images
import plotly.express as px

st.title("Flix-Viz")
st.subheader("Visualize Geo-blocked Netflix Content")


@st.cache_data
def get_data(type_="main") -> pd.DataFrame:
    if type_ == "main":
        return pd.read_pickle("Data/netflix-complete.pickle")
    elif type_ == "country":
        return pd.read_pickle("Data/country_data.pickle")

country = get_data("country")
sweden_stats = country[country["countrycode"] == "SE"]

clicked = clickable_images(
    ["data:image/png;base64,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"],
    titles=[f"Sweden - Total: {sweden_stats.tvids.values} - Movies: {sweden_stats.tmovs.values}; Series: {sweden_stats.tseries.values}"],
    div_style={"display": "flex", "justify-content": "center", "flex-wrap": "wrap"},
)

if clicked > -1:
    viz_stats_df = sweden_stats[["tseries", "tmovs"]].T
    viz_stats_df.rename(columns={30:"No. of titles"}, inplace=True)
    viz_stats_df.index = ["No. of series", "No. of movies"]

    fig = px.bar(viz_stats_df, labels={"value": "No. of titles", "index":"Type", "variable":"Legend"}, title="Titles Split in Sweden", text_auto=True, color_discrete_sequence=px.colors.qualitative.G10)
    st.plotly_chart(fig)
    st.markdown("------")
    df = get_data("main")
    df_sweden = df[df.clist.str.contains("SE")]
    df_sweden_non_zero = df_sweden[df_sweden.votes > 0]
    fig_scatter = px.scatter(df_sweden_non_zero, x="imdb_rating", y="votes", hover_data=["title", "imdbid"], title="Rating-Votes trend", labels={"votes": "No. of votes", "imdb_rating":"IMDb Rating"}, color_discrete_sequence=px.colors.qualitative.G10)
    st.plotly_chart(fig_scatter)
    st.markdown("------")
    st.markdown("##### Top Titles available in Sweden on Netflix:")
    df_top_titles = df_sweden[df_sweden.votes > 1000].sort_values(by="imdb_rating", ascending=False).head(n=10)
    clicked_title = clickable_images(
    list(df_top_titles["img"]),
    titles=[f"Image #{str(i)}" for i in range(5)],
    div_style={"display": "flex", "justify-content": "center", "flex-wrap": "wrap"},
    img_style={"margin": "5px", "height": "200px"},
    )
    st.write(df_top_titles.iloc[clicked_title][["title", "vtype", "genre", "imdb_rating"]])
    st.markdown(f"""<a href="https://www.imdb.com/title/{df_top_titles.iloc[clicked_title]["imdbid"]}"> Go to IMDB Page</a>""", unsafe_allow_html=True)
    st.markdown(f"""<a href="https://www.netflix.com/title/{df_top_titles.iloc[clicked_title]["nfid"]}"> Go to Netflix</a>""", unsafe_allow_html=True)

    st.markdown("###### *Disclaimer*: IMDB information is scraped - may be inaccurate")
    st.markdown("------")
    st.markdown("<h4><span style='font-size:small;'>Not</span> sponsored by NordVPN</h4>", unsafe_allow_html=True)

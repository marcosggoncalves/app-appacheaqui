import React from 'react';
import { StyleSheet, View, ScrollView, TouchableHighlight, RefreshControl } from 'react-native';
import { Searchbar, List, Divider, ActivityIndicator, Colors } from 'react-native-paper';
import api from '../axios';
import BannerCidade from './components/bannerCidade';
import Carousel from './components/carousel';

class Home extends React.Component {
  state = {
    search: '',
    categorias: [],
    carousel: [],
    carregamentoCarousel: true,
    carregamento: true,
    carregamentoCategorias: false,
    refreshing: false
  };

  updateSearch = (search) => {
    this.setState((prevState) => {
      prevState['search'] = search;
      prevState['carregamentoCategorias'] = true;
      this.getCategoriasSearch(prevState.search);
      return prevState;
    });
  };

  async getBanners(tipo, id = null) {
    const banners = await api.get(`/banner.php?action=all&tipo=${tipo}`);
    this.setState({ carousel: banners.data.banners, carregamentoCarousel: false });
  }

  async getCategorias() {
    const categorias = await api.get('/categorias.php?action=all');

    if (categorias.data.success) {
        this.setState({ categorias: categorias.data.categorias, carregamento: false });
    }

    this.getBanners(0);
  }

  async registrarClick(id) {
    await api.get(`/categorias.php?action=click&id=${id}`);
  }

  async getCategoriasSearch(search) {
    const getSearch = await api.get(`/categorias.php?action=search&search=${search}`);
    this.setState({ categorias: getSearch.data.data, carregamentoCategorias: false });
  }

  componentDidMount() {
    this.getCategorias();
  }

  _onRefresh = () => {
    this.setState({ refreshing: true, carregamento: true });
    setTimeout(() => {
      this.setState({ refreshing: false });
      this.getCategorias();
    }, 2000)

    clearTimeout();
  }

  render() {
    const { search, categorias, carregamento, carregamentoCarousel, carousel, refreshing } = this.state;
    const { navigation } = this.props;

    if (carregamento) {
      return (
        <View style={styles.load}>
          <ActivityIndicator size={35} animating={carregamento} color={'#006400'} />
        </View>
      );
    } else {

      return (
        <ScrollView refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={this._onRefresh} />}>
          <View>
            <BannerCidade />
          </View>
          <View style={styles.container}>
            <Carousel carregamento={carregamentoCarousel} banners={carousel} navigation={navigation}></Carousel>
            <View>
              <Searchbar
                placeholder="Buscar categoria ..."
                onChangeText={this.updateSearch}
                value={search}
              />
            </View>
            <View>

              <View style={styles.categorias} >
                {
                  categorias.map((item, index) => {
                    return (
                      <View>
                        <TouchableHighlight
                          key={item.Id}
                          activeOpacity={0.6}
                          underlayColor="#DDDDDD"
                          onPress={() => {
                            this.registrarClick(item.Id);
                            navigation.navigate('Empresas', { id: item.Id, categoria: item.descricao })
                          }}
                        >
                          <List.Item
                            key={index}
                            title={item.descricao}
                            left={props => <List.Icon {...props} icon="equal" />}
                          />
                        </TouchableHighlight>
                        <Divider />
                      </View>
                    );
                  })
                }
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  load: {
    padding: 30
  },
  input: {
    backgroundColor: 'white'
  },
  bottom: {
    marginBottom: 10
  },
  categorias: {
    height: '100%'
  }
});

export default Home;
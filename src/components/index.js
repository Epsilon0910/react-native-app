import React, { YellowBox } from "react";
import _ from 'lodash';
import { Text, StyleSheet, View, FlatList, TextInput, ActivityIndicator, Image, Dimensions, TouchableHighlight} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { searchPhotos } from "../helpers/FlickrAPI";
import * as FileSystem from 'expo-file-system';
import NetInfo from "@react-native-community/netinfo";

export default class HomeScreen extends React.Component{

  styles = StyleSheet.create({
    viewStyle: {
      marginTop: 10,
      padding: 5,
    },
    textInputStyle: {
      height: 35,
      borderWidth: 1,
      paddingLeft: 10,
      borderColor: '#009688',
      backgroundColor: '#FFFFFF',
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0078D4',
      height: 30
    },
    buttonText: {
      color: 'white',
      fontSize: 18 
    }
  })

  dropDownData = [
    { value: "1" },
    { value: "2" },
    { value: "3" },
    { value: "4" },
    { value: "5" }
  ];

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isOnline: true,
      searchQuery: 'taj mahal',
      numColumns: "4",
      page: 1,
      photos : []
    };
    this.updateSearchQuery = this.updateSearchQuery.bind(this);
    this.onChangeDropDownValue = this.onChangeDropDownValue.bind(this);
    this.onClickSearchButton = this.onClickSearchButton.bind(this);
  }

  componentDidMount() {
    NetInfo.fetch().then(state => {
      if (!state.isInternetReachable) {
        this.setState({
          isOnline: false
        })
      }
    })

    setTimeout(() => {
      searchPhotos(this.state.searchQuery, this.state.page, this.state.isOnline)
        .then(response => {
          if (response.length) {
            this.setState({
              photos: response,
              isLoading: false
            })
          } else {
            alert('User is offline, Please Turn on Mobile Network to perform search query');
          }
        })
    }, 1500)
  }

  updateSearchQuery(text) {
    this.setState({ searchQuery : text})
  }

  onChangeDropDownValue(value) {
    this.setState({
      numColumns: value
    })
  }

  onClickSearchButton() {
    if(this.state.searchQuery){
      this.setState({isLoading: true});
      searchPhotos(this.state.searchQuery, this.state.page, this.state.isOnline)
        .then(response => {
          if(response.length) {
            this.setState({
              photos: response,
              isLoading: false
            })
          } else {
            alert('User is offline, Please Turn on Mobile Network to perform search query');
          }
        })
    }
  }

  handleLoadMorePhotos = () => {
    NetInfo.fetch().then(state => {
      if (state.isInternetReachable) {
        this.setState({
          page: this.state.page + 1
        }, () => {
          searchPhotos(this.state.searchQuery, this.state.page, this, this.state.isOnline)
            .then(response => {
              this.setState({
                photos: [...this.state.photos, ...response]
              })
            })
        })
      }
    })
  }

  renderSeparator() {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE",
          marginLeft: "5%",
          marginRight: "5%"
        }}
      />
    );
  };

  render() {
    const path = `${FileSystem.documentDirectory}`;
    if (this.state.isLoading) {
      //Loading View while data is loading
      return (
        <View style={{ flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      //ListView to show with textinput used as search bar
      <View style={this.styles.viewStyle}>
        <TextInput
          style={this.styles.textInputStyle}
          underlineColorAndroid="transparent"
          placeholder="Search Here"
          value={this.state.searchQuery}
          onChangeText={this.updateSearchQuery}
        />
        <View style={{ flexDirection: 'row' }}>
          <View style={{flex: 1}}>
            <Dropdown
              label='Number of Columns'
              value={this.state.numColumns}
              onChangeText={this.onChangeDropDownValue}
              data={this.dropDownData}
            />
          </View>
          <View style={{ width: "50%", marginLeft: 8, marginTop: 25 }}>
            <TouchableHighlight
              style={this.styles.button}
              underlayColor='white'
              onPress={() => this.onClickSearchButton()}>
              <View>
                <Text style={this.styles.buttonText}>Search on Flickr</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <View>
          <View>
            <FlatList
              data={this.state.photos}
              style={{ backgroundColor: "#fff", height: (Dimensions.get('window').height - 200) }}
              renderItem={({ item }) => <View>
                <Image
                  style={{ width: (Dimensions.get('window').width - 20) / this.state.numColumns, height: Dimensions.get('window').width / this.state.numColumns, margin: 1 }}
                  source={{ uri: item.url_m, cache: 'only-if-cached'}}
                />
              </View>}
              enableEmptySections={true}
              numColumns={this.state.numColumns}
              key={this.state.numColumns}
              keyExtractor={item => item.id}
              onEndReached={this.handleLoadMorePhotos}
              onEndReachedThreshold={1}
            />
          </View>
        </View>
      </View>
    );
  }
}

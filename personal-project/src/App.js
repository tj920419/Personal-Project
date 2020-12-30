import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import { firestore } from './firebase.js';
import logo from './img/Logo2.0.png';
import block from './img/Block.png';
import line from './img/Line.png';
import background from './img/Background_Earth.jpg';
import loadingGif from './img/Loading.gif';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';

const setExplanation =
  'To select "Intersection" or "Union" will allow you to choose whether to render the intersection or the union of search results, given inputted search conditions.';
const withExplanation =
  'To select "Include" or "Exclude" will allow you to choose whether to search articles "Include" or "Exclude" the inputted string.';

class App extends React.Component {
  constructor(props) {
    super(props);
    //Set Search Condition
    this.changeSet = this.changeSet.bind(this);
    this.inputSearchKeyword = this.inputSearchKeyword.bind(this);
    this.changeSearchOption = this.changeSearchOption.bind(this);
    this.clickAddNewSearchButton = this.clickAddNewSearchButton.bind(this);
    //Submit Search Conditions
    this.clickSearchSubmitButton = this.clickSearchSubmitButton.bind(this);
    this.dataDownloading = this.dataDownloading.bind(this);
    this.runConditionFiltering = this.runConditionFiltering.bind(this);
    this.checkConditionFiltering = this.checkConditionFiltering.bind(this);
    //Edit Search Condiiton
    this.withOrWithoutYou = this.withOrWithoutYou.bind(this);
    this.editSearchCondition = this.editSearchCondition.bind(this);
    this.deleteSearchCondition = this.deleteSearchCondition.bind(this);
    this.inputNewSearchKeyword = this.inputNewSearchKeyword.bind(this);
    this.changeNewSearchOption = this.changeNewSearchOption.bind(this);
    this.saveSearchCondition = this.saveSearchCondition.bind(this);
    this.cancelEditingCondition = this.cancelEditingCondition.bind(this);
    //Check Media Brand
    this.checkMediaBrand = this.checkMediaBrand.bind(this);
    //Adjust Result Component
    this.changeResultOrder = this.changeResultOrder.bind(this);
    this.reOrdering = this.reOrdering.bind(this);
    this.changeCurrentPaging = this.changeCurrentPaging.bind(this);
    this.clickPagingArrow = this.clickPagingArrow.bind(this);
    this.changePagingAmount = this.changePagingAmount.bind(this);
    this.changeDetailShowing = this.changeDetailShowing.bind(this);
    //Others
    this.alertClick = this.alertClick.bind(this);
    //State
    this.state = {
      setStatus: true,
      mediaBrand: [
        {
          brandName: 'Bloomberg Businessweek',
          checked: true,
          newsAcquired: [],
        },
        { brandName: 'Financial Times', checked: true, newsAcquired: [] },
        { brandName: 'The Economist', checked: true, newsAcquired: [] },
        { brandName: 'The New York Times', checked: true, newsAcquired: [] },
        {
          brandName: 'The Wall Street Journal',
          checked: true,
          newsAcquired: [],
        },
        { brandName: 'Time Magazine', checked: true, newsAcquired: [] },
      ],
      searchConditions: [],
      newSearchType: 'Headline',
      newSearchValue: '',
      newSearchPlaceHolder: 'Please Input Your Keyword!',
      articlesAcquired: [],
      searchResults: [],
      currentPaging: 1,
      fullPaging: 1,
      pagingAmount: 10,
      detailShowing: true,
      searchClicked: false,
      resultOrder: 'orderSearchCondition',
      startDate: 20200101,
      endDate: 20201231,
      loading: false,
      alert: '',
      searchClassStatus: {},
    };
  }

  //Router
  componentDidMount() {
    if (window.location.search !== '') {
      this.setState({ loading: true });
      const paramsString = window.location.search.substr(1);
      const paramsObject = JSON.parse(
        '{"' +
          decodeURI(paramsString)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
          '"}'
      );
      const paramsKeys = Object.keys(paramsObject);
      const paramsSearchConditions = [];
      let paramsSet,
        paramsResultOrder,
        paramsPaging,
        paramsPagingAmount,
        paramsDetailShowing,
        paramsWithOrWithout,
        paramsSearchValue,
        paramsSearchType;
      const optionary = {
        H: 'Headline',
        S: 'Subheadline',
        A: 'Author',
        T: 'Text',
        OSC: 'orderSearchCondition',
        AU: 'arrowUp',
        AD: 'arrowDown',
      };

      for (let u = 0; u < paramsKeys.length; u += 1) {
        if (paramsKeys[u] === 'SS') {
          paramsSet = paramsObject['SS'] === 'true';
          paramsKeys.splice(u, 1);
          u -= 1;
        } else if (paramsKeys[u] === 'RO') {
          paramsResultOrder = optionary[paramsObject['RO']];
          console.log(paramsResultOrder);
          paramsKeys.splice(u, 1);
          u -= 1;
        } else if (paramsKeys[u] === 'PG') {
          paramsPaging = paramsObject['PG'];
          paramsKeys.splice(u, 1);
          u -= 1;
        } else if (paramsKeys[u] === 'PA') {
          paramsPagingAmount =
            paramsObject['PA'] === 'All' ? 'All' : parseInt(paramsObject['PA']);
          paramsKeys.splice(u, 1);
          u -= 1;
        } else if (paramsKeys[u] === 'DS') {
          paramsDetailShowing = paramsObject['DS'] === 'true';
          paramsKeys.splice(u, 1);
          u -= 1;
        } else {
          if (paramsKeys[u].slice(0, 2) === 'SC') {
            paramsWithOrWithout = paramsObject[paramsKeys[u]][0] !== 'F';
            if (paramsObject[paramsKeys[u]].slice(0, 2) === 'SD') {
              paramsSearchValue = paramsObject[paramsKeys[u]].slice(2);
              paramsSearchType = 'Start Date';
            } else if (paramsObject[paramsKeys[u]].slice(0, 2) === 'ED') {
              paramsSearchValue = paramsObject[paramsKeys[u]].slice(2);
              paramsSearchType = 'End Date';
            } else {
              paramsSearchValue = paramsObject[paramsKeys[u]].slice(2);
              paramsSearchType = optionary[paramsObject[paramsKeys[u]][1]];
            }
            const paramsSearchCondition = {
              withOrWithout: paramsWithOrWithout,
              searchValue: paramsSearchValue,
              searchType: paramsSearchType,
              editing: false,
              searchValueEditing: paramsSearchValue,
              searchTypeEditing: paramsSearchType,
              resultAmount: 0,
            };
            paramsSearchConditions.push(paramsSearchCondition);
          }
        }
      }

      this.setState({
        setStatus: paramsSet,
        resultOrder: paramsResultOrder,
        currentPaging: parseInt(paramsPaging),
        pagingAmount: paramsPagingAmount,
        detailShowing: paramsDetailShowing,
        searchConditions: paramsSearchConditions,
        searchClicked: true,
      });

      this.dataDownloading(paramsSearchConditions, paramsSet);
    }
  }

  /*==============================
  ============Functions===========
  ==============================*/
  /*Set Search Condition*/
  changeSet() {
    const newSetStatus = !this.state.setStatus;
    this.checkConditionFiltering(undefined, newSetStatus);
  }

  inputSearchKeyword(e) {
    this.setState({ newSearchValue: e.target.value });
  }

  changeSearchOption(e) {
    if (e.target.value === 'Start Date' || e.target.value === 'End Date') {
      this.setState({
        newSearchType: e.target.value,
        newSearchPlaceHolder: 'Please enter eg:20201231',
      });
    } else {
      this.setState({
        newSearchType: e.target.value,
        newSearchPlaceHolder: 'Please Input Your Keyword!',
      });
    }
  }

  clickAddNewSearchButton() {
    if (this.state.newSearchValue === '') {
      this.setState({ alert: "Haven't input anything yet!" });
    } else {
      if (
        this.state.newSearchType === 'Start Date' ||
        this.state.newSearchType === 'End Date'
      ) {
        if (
          isNaN(parseInt(this.state.newSearchValue)) ||
          parseInt(this.state.newSearchValue) < 10000000 ||
          parseInt(this.state.newSearchValue) > 99999999
        ) {
          this.setState({ alert: 'Please input a valid 8-digit number!' }); //Unfinished
          return;
        }
      }

      const newSearchCondition = {
        withOrWithout: true,
        searchValue: this.state.newSearchValue,
        searchType: this.state.newSearchType,
        editing: false,
        searchValueEditing: this.state.newSearchValue,
        searchTypeEditing: this.state.newSearchType,
        resultAmount: 0,
      };
      this.state.searchConditions.push(newSearchCondition);
      this.setState({
        searchConditions: this.state.searchConditions,
        newSearchValue: '',
      });
      this.checkConditionFiltering(this.state.searchConditions);
    }
  }

  /*Submit Search Conditions*/
  clickSearchSubmitButton() {
    this.setState({ loading: true });
    this.dataDownloading(this.state.searchConditions);
  }

  dataDownloading(searchConditions, setStatus) {
    const promiseElement = [];
    const aquiredResult = [];
    const mediaBrandStatus = JSON.parse(JSON.stringify(this.state.mediaBrand));
    const getData = (sent) => {
      return firestore.collection(sent).get();
    };

    for (let m = 0; m < mediaBrandStatus.length; m += 1) {
      promiseElement.push(getData(mediaBrandStatus[m].brandName));
    }
    Promise.all(promiseElement).then((Response) => {
      Response.forEach((response) => {
        response.forEach((res) => {
          for (let m = 0; m < mediaBrandStatus.length; m += 1) {
            if (mediaBrandStatus[m].brandName === res.data().Source) {
              mediaBrandStatus[m].newsAcquired.push(res.data());
              if (mediaBrandStatus[m].checked === true) {
                aquiredResult.push(res.data());
              }
            }
          }
        });
      });
      this.setState({
        mediaBrand: mediaBrandStatus,
        searchClicked: true,
        searchClassStatus: {
          searchAll: 'searchAllAfter',
          searchAllTop: 'searchAllTopAfter',
          searchResultGroup: 'searchResultGroupAfter',
          matchTitle: 'matchTitleAfter',
          searchConditionLeftColumn: 'searchConditionLeftColumnAfter',
          searchConditionRightColumn: 'searchConditionRightColumnAfter',
          searchGroup: 'searchGroupAfter',
          searchGroupFirstLine: 'searchGroupFirstLineAfter',
          mediaBrandComponentClass: 'mediaBrandComponentAfter',
          mainLeft: 'mainLeftAfter',
          mainRight: 'mainRightAfter',
          searchResultComponentClass: 'searchResultComponentAfter',
          addNewSearchButton: 'addNewSearchButtonAfter',
        },
      });
      this.runConditionFiltering(aquiredResult, searchConditions, setStatus);
    });
  }

  runConditionFiltering(aquiredresult, searchconditions, setstatus) {
    let finalResult = [];
    let searchTypeNumberN;
    const searchConditions =
      searchconditions === undefined
        ? this.state.searchConditions
        : searchconditions;
    const setStatus =
      setstatus === undefined ? this.state.setStatus : setstatus;
    const searchresult = JSON.parse(JSON.stringify(aquiredresult));

    if (searchresult.length > 0) {
      for (let m = 0; m < this.state.mediaBrand.length; m += 1) {
        if (this.state.mediaBrand[m].checked === false) {
          for (let q = 0; q < searchresult.length; q += 1) {
            if (this.state.mediaBrand[m].brandName === searchresult[q].Source) {
              searchresult.splice(q, 1);
              q -= 1;
            }
          }
        }
      }
    }

    if (setStatus === true) {
      //=====Set And
      for (let n = 0; n < searchConditions.length; n += 1) {
        searchTypeNumberN = searchConditions[n].searchType;

        //And---String
        if (
          searchTypeNumberN !== 'Start Date' &&
          searchTypeNumberN !== 'End Date'
        ) {
          //And---String---With
          if (searchConditions[n].withOrWithout === true) {
            for (let o = 0; o < searchresult.length; o += 1) {
              if (
                !searchresult[o][searchTypeNumberN] ||
                searchresult[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  false
              ) {
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
            //And---String---Without
          } else if (searchConditions[n].withOrWithout === false) {
            for (let o = 0; o < searchresult.length; o += 1) {
              if (
                searchresult[o][searchTypeNumberN] &&
                searchresult[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  true
              ) {
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
          }
        } else {
          //And---Number
          for (let o = 0; o < searchresult.length; o += 1) {
            const dateIndex = parseInt(searchresult[o][searchTypeNumberN]);
            const dateIndexCondition = parseInt(
              searchConditions[n].searchValue
            );
            if (searchTypeNumberN === 'Start Date') {
              if (
                !searchresult[o]['Start Date'] ||
                dateIndex < dateIndexCondition
              ) {
                searchresult.splice(o, 1);
                o -= 1;
              }
            } else if (searchTypeNumberN === 'End Date') {
              if (
                !searchresult[o]['End Date'] ||
                dateIndex > dateIndexCondition
              ) {
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
          }
        }
        finalResult = searchresult;
        searchConditions[n].resultAmount = searchresult.length;
      }
      //=====Set Or
    } else if (setStatus === false) {
      for (let n = 0; n < searchConditions.length; n += 1) {
        searchTypeNumberN = searchConditions[n].searchType;
        //Or---String
        if (
          searchTypeNumberN !== 'Start Date' &&
          searchTypeNumberN !== 'End Date'
        ) {
          //Or---String---With
          if (searchConditions[n].withOrWithout === true) {
            for (let o = 0; o < searchresult.length; o += 1) {
              if (
                searchresult[o][searchTypeNumberN] &&
                searchresult[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  true
              ) {
                finalResult.push(searchresult[o]);
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
            //Or---String---Without
          } else if (searchConditions[n].withOrWithout === false) {
            for (let o = 0; o < searchresult.length; o += 1) {
              if (
                !searchresult[o][searchTypeNumberN] ||
                searchresult[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  false
              ) {
                finalResult.push(searchresult[o]);
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
          }
        } else {
          //Or---Number
          for (let o = 0; o < searchresult.length; o += 1) {
            const dateIndex = parseInt(searchresult[o][searchTypeNumberN]);
            const dateIndexCondition = parseInt(
              searchConditions[n].searchValue
            );

            if (searchTypeNumberN === 'Start Date') {
              if (
                searchresult[o]['Start Date'] &&
                dateIndex >= dateIndexCondition
              ) {
                finalResult.push(searchresult[o]);
                searchresult.splice(o, 1);
                o -= 1;
              }
            } else if (searchTypeNumberN === 'End Date') {
              if (
                searchresult[o]['End Date'] &&
                dateIndex <= dateIndexCondition
              ) {
                finalResult.push(searchresult[o]);
                searchresult.splice(o, 1);
                o -= 1;
              }
            }
          }
        }
        searchConditions[n].resultAmount = finalResult.length;
      }
    }

    const pagingIndex =
      finalResult !== undefined && this.state.pagingAmount !== 'All'
        ? Math.ceil(finalResult.length / this.state.pagingAmount)
        : 1;

    const newCurrentPaging =
      this.state.currentPaging > pagingIndex ? 1 : this.state.currentPaging;

    const finalResultOrdered = this.reOrdering(
      this.state.resultOrder,
      finalResult,
      searchConditions
    );

    this.setState({
      searchResults: finalResultOrdered,
      searchConditions: searchConditions,
      setStatus: setStatus,
      articlesAcquired: aquiredresult,
      fullPaging: pagingIndex,
      currentPaging: newCurrentPaging,
      loading: false,
    });
  }

  checkConditionFiltering(searchConditions, setStatus) {
    const aquiredResult = JSON.parse(
      JSON.stringify(this.state.articlesAcquired)
    );
    this.runConditionFiltering(aquiredResult, searchConditions, setStatus);
  }

  /*Edit Search Condiiton*/
  withOrWithoutYou(e) {
    const yourIndex = parseInt(e.currentTarget.id.slice(22));
    const stateStatus = this.state.searchConditions;
    stateStatus[yourIndex].withOrWithout = !stateStatus[yourIndex]
      .withOrWithout;
    this.checkConditionFiltering(stateStatus);
  }

  editSearchCondition(e) {
    const editIndex = parseInt(e.target.id.slice(19));
    const stateStatus = this.state.searchConditions;
    stateStatus[editIndex].editing = true;
    this.setState({ searchConditions: stateStatus });
  }

  deleteSearchCondition(e) {
    const deleteIndex = parseInt(e.target.id.slice(21));
    const stateStatus = this.state.searchConditions;
    stateStatus.splice(deleteIndex, 1);
    if (stateStatus.length === 0) {
      window.history.replaceState(null, null, '/');
    }
    this.checkConditionFiltering(stateStatus);
  }

  inputNewSearchKeyword(e) {
    const inputIndex = parseInt(e.target.id.slice(21));
    const stateStatus = this.state.searchConditions;
    stateStatus[inputIndex].searchValueEditing = e.target.value;
    this.setState({ searchConditions: stateStatus });
  }

  changeNewSearchOption(e) {
    const selectIndex = parseInt(e.target.id.slice(21));
    const stateStatus = this.state.searchConditions;
    stateStatus[selectIndex].searchTypeEditing = e.target.value;
    this.setState({ searchConditions: stateStatus });
  }

  saveSearchCondition(e) {
    const saveIndex =
      e.key === 'Enter'
        ? parseInt(e.target.id.slice(21))
        : parseInt(e.target.id.slice(19));
    const stateStatus = this.state.searchConditions;
    if (this.state.searchConditions[saveIndex].searchValueEditing === '') {
      this.setState({ alert: "Haven't input anything yet!" });
    } else {
      stateStatus[saveIndex].searchValue = this.state.searchConditions[
        saveIndex
      ].searchValueEditing;
      stateStatus[saveIndex].searchType = this.state.searchConditions[
        saveIndex
      ].searchTypeEditing;
      stateStatus[saveIndex].editing = false;
      this.checkConditionFiltering(stateStatus);
    }
  }

  cancelEditingCondition(e) {
    const cancelIndex = parseInt(e.target.id.slice(28));
    const stateStatus = this.state.searchConditions;
    stateStatus[cancelIndex].editing = false;
    stateStatus[cancelIndex].searchValueEditing =
      stateStatus[cancelIndex].searchValue;
    stateStatus[cancelIndex].searchTypeEditing =
      stateStatus[cancelIndex].searchType;
    this.setState({ searchConditions: stateStatus });
  }

  /*Check Media Brand*/
  checkMediaBrand(e) {
    const mediaBrandStatus = this.state.mediaBrand;
    const articlesAcquiredStatus = JSON.parse(
      JSON.stringify(this.state.articlesAcquired)
    );
    for (let l = 0; l < mediaBrandStatus.length; l += 1) {
      if (mediaBrandStatus[l].brandName === e.target.id) {
        if (mediaBrandStatus[l].checked === true) {
          for (let q = 0; q < articlesAcquiredStatus.length; q += 1) {
            if (articlesAcquiredStatus[q].Source === e.target.id) {
              articlesAcquiredStatus.splice(q, 1);
              q -= 1;
            }
          }
          mediaBrandStatus[l].checked = false;
        } else if (mediaBrandStatus[l].checked === false) {
          for (let q = 0; q < mediaBrandStatus[l].newsAcquired.length; q += 1) {
            articlesAcquiredStatus.push(mediaBrandStatus[l].newsAcquired[q]);
          }
          mediaBrandStatus[l].checked = true;
        }
      }
    }
    this.setState({
      mediaBrand: mediaBrandStatus,
    });
    this.runConditionFiltering(articlesAcquiredStatus);
  }

  /*Adjust Result Component*/
  changeResultOrder(e) {
    let newResultOrder;
    if (e.target.id === 'orderSearchCondition') {
      if (this.state.resultOrder === 'orderSearchCondition') {
        return;
      } else {
        newResultOrder = 'orderSearchCondition';
      }
    } else {
      if (
        this.state.resultOrder === 'orderSearchCondition' ||
        this.state.resultOrder === 'arrowUp'
      ) {
        newResultOrder = 'arrowDown';
      } else if (this.state.resultOrder === 'arrowDown') {
        newResultOrder = 'arrowUp';
      }
    }

    const searchResultsOrdered = this.reOrdering(
      newResultOrder,
      this.state.searchResults
    );

    this.setState({
      resultOrder: newResultOrder,
      searchResults: searchResultsOrdered,
    });
  }

  reOrdering(newResultOrder, preOrdered, searchconditions) {
    const postOrdered = [];
    const searchConditions =
      searchconditions !== undefined
        ? searchconditions
        : this.state.searchConditions;

    if (newResultOrder === 'orderSearchCondition') {
      for (let n = 0; n < searchConditions.length; n += 1) {
        const searchTypeNumberN = searchConditions[n].searchType;
        if (
          searchTypeNumberN !== 'Start Date' &&
          searchTypeNumberN !== 'End Date'
        ) {
          if (searchConditions[n].withOrWithout === true) {
            for (let o = 0; o < preOrdered.length; o += 1) {
              if (
                preOrdered[o][searchTypeNumberN] &&
                preOrdered[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  true
              ) {
                const [move] = preOrdered.splice(o, 1);
                postOrdered.push(move);
                o -= 1;
              }
            }
          } else if (searchConditions[n].withOrWithout === false) {
            for (let o = 0; o < preOrdered.length; o += 1) {
              if (
                !preOrdered[o][searchTypeNumberN] ||
                preOrdered[o][searchTypeNumberN]
                  .toLowerCase()
                  .includes(searchConditions[n].searchValue.toLowerCase()) ===
                  false
              ) {
                const [move] = preOrdered.splice(o, 1);
                postOrdered.push(move);
                o -= 1;
              }
            }
          }
        } else {
          for (let o = 0; o < preOrdered.length; o += 1) {
            const dateIndex = parseInt(preOrdered[o][searchTypeNumberN]);
            const dateIndexCondition = parseInt(
              searchConditions[n].searchValue
            );
            if (searchTypeNumberN === 'Start Date') {
              if (
                preOrdered[o]['Start Date'] &&
                dateIndex >= dateIndexCondition
              ) {
                const [move] = preOrdered.splice(o, 1);
                postOrdered.push(move);
                o -= 1;
              }
            } else if (searchTypeNumberN === 'End Date') {
              if (
                preOrdered[o]['End Date'] &&
                dateIndex <= dateIndexCondition
              ) {
                const [move] = preOrdered.splice(o, 1);
                postOrdered.push(move);
                o -= 1;
              }
            }
          }
        }
      }
    } else if (newResultOrder === 'arrowDown') {
      for (let s = this.state.endDate; s > this.state.startDate; s -= 1) {
        for (let o = 0; o < preOrdered.length; o += 1) {
          if (preOrdered[o]['End Date'] === JSON.stringify(s)) {
            const [move] = preOrdered.splice(o, 1);
            postOrdered.push(move);
            o -= 1;
          }
        }
      }
    } else if (newResultOrder === 'arrowUp') {
      for (let s = this.state.startDate; s < this.state.endDate; s += 1) {
        for (let o = 0; o < preOrdered.length; o += 1) {
          if (preOrdered[o]['Start Date'] === JSON.stringify(s)) {
            const [move] = preOrdered.splice(o, 1);
            postOrdered.push(move);
            o -= 1;
          }
        }
      }
    }
    return postOrdered;
  }

  changeCurrentPaging(e) {
    this.setState({ currentPaging: parseInt(e.target.innerHTML) });
  }

  clickPagingArrow(e) {
    const currentPagingStatus = this.state.currentPaging;
    const fullpagingStatus = this.state.fullPaging;
    if (e.target.id === 'mostLeft') {
      this.setState({ currentPaging: 1 });
    } else if (e.target.id === 'moreLeft') {
      this.setState({ currentPaging: currentPagingStatus - 1 });
    } else if (e.target.id === 'moreRight') {
      this.setState({ currentPaging: currentPagingStatus + 1 });
    } else if (e.target.id === 'mostRight') {
      this.setState({ currentPaging: fullpagingStatus });
    }
  }

  changePagingAmount(e) {
    let pagingIndex;
    let pagingAmountIndex;
    if (e.target.value === 'All') {
      pagingIndex = this.state.searchResults.length > 0 ? 1 : 0;
      pagingAmountIndex = 'All';
    } else {
      pagingIndex = Math.ceil(this.state.searchResults.length / e.target.value);
      pagingAmountIndex = parseInt(e.target.value);
    }
    this.setState({
      fullPaging: pagingIndex,
      pagingAmount: pagingAmountIndex,
      currentPaging: 1,
    });
  }

  changeDetailShowing(e) {
    if (this.state.detailShowing !== e) {
      this.setState({ detailShowing: e });
    }
  }

  /*Others*/
  alertClick() {
    this.setState({ alert: '' });
  }

  /*==============================
  =============Render=============
  ==============================*/

  render() {
    const searchClassStatus = this.state.searchClassStatus;

    /*=====Router Params=====*/
    if (this.state.searchConditions.length > 0) {
      const routerParams = new URLSearchParams({});

      //Set
      routerParams.append('SS', JSON.stringify(this.state.setStatus));

      //Result Order
      if (this.state.resultOrder === 'orderSearchCondition') {
        routerParams.append('RO', 'OSC');
      } else if (this.state.resultOrder === 'arrowUp') {
        routerParams.append('RO', 'AU');
      } else if (this.state.resultOrder === 'arrowDown') {
        routerParams.append('RO', 'AD');
      }

      //CurrentPaging
      routerParams.append('PG', JSON.stringify(this.state.currentPaging));

      //PagingAmount
      routerParams.append('PA', this.state.pagingAmount);

      //Detail Showing
      routerParams.append('DS', JSON.stringify(this.state.detailShowing));

      //Search Condition
      for (let t = 0; t < this.state.searchConditions.length; t += 1) {
        let singleSC = '';
        if (this.state.searchConditions[t].searchType === 'Start Date') {
          singleSC = 'SD' + this.state.searchConditions[t].searchValue;
        } else if (this.state.searchConditions[t].searchType === 'End Date') {
          singleSC = 'ED' + this.state.searchConditions[t].searchValue;
        } else if (this.state.searchConditions[t].withOrWithout === true) {
          singleSC =
            'T' +
            this.state.searchConditions[t].searchType.substr(0, 1) +
            this.state.searchConditions[t].searchValue;
        } else if (this.state.searchConditions[t].withOrWithout === false) {
          singleSC =
            'F' +
            this.state.searchConditions[t].searchType.substr(0, 1) +
            this.state.searchConditions[t].searchValue;
        }
        routerParams.append('SC' + t, singleSC);
      }

      window.history.replaceState(null, null, '?' + routerParams.toString());
    }

    let setComponent = [];
    let buttonComponent = [];
    const mediaBrandComponent = [];
    let pagingComponent = [];
    let searchResultComponent = [];
    let searchConditionComponent = [];
    let searchResultAllComponent = [];
    const homePageUrl = 'https://newsplatform-9a5f4.web.app/';
    const loadingImgClass =
      this.state.loading === true ? 'loadingOn' : 'loadingOff';
    const alertObjectClass = this.state.alert !== '' ? 'alertOn' : 'alertOff';

    //=====Set Component
    const andElement = this.state.setStatus ? 'andElement' : '';
    const orElement = this.state.setStatus ? '' : 'orElement';

    if (
      this.state.searchConditions.length === 1 &&
      this.state.searchClicked === false
    ) {
      setComponent = (
        <div className='setComponent' key={'setComponent0'}>
          <div className={'conditionsTitle'}>Search Conditions</div>
        </div>
      );
    } else if (
      this.state.searchConditions.length > 1 &&
      this.state.searchClicked === false
    ) {
      setComponent = (
        <div className='setComponent' key={'setComponent0'}>
          <div className='setElements set1f'>
            <div>
              <div
                className={'setElement and1f ' + andElement}
                onClick={this.changeSet}
              >
                Intersection{' '}
              </div>

              <div
                className={'setElement or1f ' + orElement}
                onClick={this.changeSet}
              >
                Union
              </div>
              <div className='setExplanation setExplanation1f '>
                {setExplanation}
              </div>
            </div>
          </div>
          <div className={'conditionsTitle conditionsTitle2f'}>
            Search Conditions
          </div>
        </div>
      );
    } else if (
      this.state.searchConditions.length === 1 &&
      this.state.searchClicked === true
    ) {
      setComponent = (
        <div className='setComponent' key={'setComponent0'}>
          <div className={'conditionsTitle conditionsTitle1t'}>
            Search Conditions
          </div>
          <div className={'matchTitle ' + searchClassStatus.matchTitle}>
            Accumulated <br></br> Matches
          </div>
        </div>
      );
    } else if (
      this.state.searchConditions.length > 1 &&
      this.state.searchClicked === true
    ) {
      setComponent = (
        <div
          className='setComponent'
          key={'setComponent0'}
          style={{ display: 'flex' }}
        >
          <div className='setElements'>
            <div
              className={'setElement ' + andElement}
              onClick={this.changeSet}
            >
              Intersection
            </div>
            <div className={'setElement ' + orElement} onClick={this.changeSet}>
              Union
            </div>
            <div className='setExplanation'>{setExplanation} </div>
          </div>
          <div className={'conditionsTitle conditionsTitle2t'}>
            Search Conditions
          </div>
          <div className={'matchTitle ' + searchClassStatus.matchTitle}>
            Accumulated <br></br> Matches
          </div>
        </div>
      );
    }

    //=====Button Component
    if (
      this.state.searchConditions.length > 0 &&
      this.state.searchClicked === false
    ) {
      buttonComponent = (
        <div className='searchGroupSecondLine'>
          <button
            className={
              'addNewSearchButton ' + searchClassStatus.addNewSearchButton
            }
            onClick={() => {
              this.clickAddNewSearchButton();
            }}
          >
            Add New Search Condition
          </button>
          <button
            className='searchSubmitButton'
            onClick={this.clickSearchSubmitButton}
          >
            Search Submit
          </button>
        </div>
      );
    } else {
      buttonComponent = (
        <div className='searchGroupSecondLine'>
          <button
            className={
              'addNewSearchButton ' + searchClassStatus.addNewSearchButton
            }
            onClick={() => {
              this.clickAddNewSearchButton();
            }}
          >
            Add New Search Condition
          </button>
        </div>
      );
    }

    //=====Media Brand Component
    for (let k = 0; k < this.state.mediaBrand.length; k += 1) {
      const mediaBrandTemplate = (
        <div
          className={
            'mediaBrandComponent ' + searchClassStatus.mediaBrandComponentClass
          }
          key={'mediaBrandComponent' + k}
        >
          <input
            className='mediaBrandCheckBox'
            id={this.state.mediaBrand[k].brandName}
            type='checkbox'
            onChange={this.checkMediaBrand}
            checked={this.state.mediaBrand[k].checked}
          ></input>
          <label htmlFor={this.state.mediaBrand[k].brandName}>
            {this.state.mediaBrand[k].brandName}
          </label>
        </div>
      );
      mediaBrandComponent.push(mediaBrandTemplate);
    }

    //=====Paging Component
    const currentPagingStatus = this.state.currentPaging;
    const fullpagingStatus = this.state.fullPaging;
    const pagingAmountStatus =
      this.state.pagingAmount === 'All'
        ? this.state.articlesAcquired.length
        : this.state.pagingAmount;
    const pagingElements = [];
    let mostLeft,
      moreLeft,
      moreRight,
      mostRight = <div className='resultPagingOption'></div>;

    //Left & Right Arrows
    if (currentPagingStatus > 3 && fullpagingStatus > 5) {
      mostLeft = (
        <div
          className='resultPagingOption pagingArrows'
          onClick={(e) => {
            this.clickPagingArrow(e);
          }}
          id='mostLeft'
        >
          {'<<'}
        </div>
      );
    }
    if (currentPagingStatus > 1) {
      moreLeft = (
        <div
          className='resultPagingOption pagingArrows'
          onClick={(e) => {
            this.clickPagingArrow(e);
          }}
          id='moreLeft'
        >
          {'<'}
        </div>
      );
    }
    if (currentPagingStatus !== fullpagingStatus && fullpagingStatus !== 0) {
      moreRight = (
        <div
          className='resultPagingOption pagingArrows'
          onClick={(e) => {
            this.clickPagingArrow(e);
          }}
          id='moreRight'
        >
          {'>'}
        </div>
      );
    }
    if (fullpagingStatus - currentPagingStatus > 2 && fullpagingStatus > 5) {
      mostRight = (
        <div
          className='resultPagingOption pagingArrows'
          onClick={(e) => {
            this.clickPagingArrow(e);
          }}
          id='mostRight'
        >
          {'>>'}
        </div>
      );
    }

    //Paging Numbers
    if (fullpagingStatus < 6 || currentPagingStatus < 4) {
      for (let r = 0; r < 5 && r < fullpagingStatus; r += 1) {
        const currentPagingElement =
          r + 1 === currentPagingStatus ? 'currentPagingElement' : '';
        const pagingElement = (
          <div
            className={'pagingElement ' + currentPagingElement}
            onClick={(e) => {
              this.changeCurrentPaging(e);
            }}
          >
            {r + 1}
          </div>
        );
        pagingElements.push(pagingElement);
      }
    } else if (
      fullpagingStatus > 5 &&
      fullpagingStatus - currentPagingStatus > 1
    ) {
      for (
        let r = currentPagingStatus - 2;
        r < currentPagingStatus + 3;
        r += 1
      ) {
        const currentPagingElement =
          r === currentPagingStatus ? 'currentPagingElement' : '';
        const pagingElement = (
          <div
            className={'pagingElement ' + currentPagingElement}
            onClick={(e) => {
              this.changeCurrentPaging(e);
            }}
          >
            {r}
          </div>
        );
        pagingElements.push(pagingElement);
      }
    } else if (
      fullpagingStatus > 5 &&
      fullpagingStatus - currentPagingStatus === 1
    ) {
      for (
        let r = currentPagingStatus - 3;
        r < currentPagingStatus + 2;
        r += 1
      ) {
        const currentPagingElement =
          r === currentPagingStatus ? 'currentPagingElement' : '';
        const pagingElement = (
          <div
            className={'pagingElement ' + currentPagingElement}
            onClick={(e) => {
              this.changeCurrentPaging(e);
            }}
          >
            {r}
          </div>
        );
        pagingElements.push(pagingElement);
      }
    } else if (
      fullpagingStatus > 5 &&
      fullpagingStatus - currentPagingStatus === 0
    ) {
      for (
        let r = currentPagingStatus - 4;
        r < currentPagingStatus + 1;
        r += 1
      ) {
        const currentPagingElement =
          r === currentPagingStatus ? 'currentPagingElement' : '';
        const pagingElement = (
          <div
            className={'pagingElement ' + currentPagingElement}
            onClick={(e) => {
              this.changeCurrentPaging(e);
            }}
          >
            {r}
          </div>
        );
        pagingElements.push(pagingElement);
      }
    }

    pagingComponent = (
      <div className='resultPaging'>
        <div className='resultPagingOption'></div>
        {mostLeft}
        {moreLeft}
        <div className='pagingElements'>{pagingElements}</div>
        {moreRight}
        {mostRight}
        <div className='resultPagingOption'></div>
      </div>
    );

    //=====Search Result Component
    if (this.state.searchResults.length === 0) {
      searchResultComponent = (
        <div className='noSearchResult'>Currently No Search Result!</div>
      );
    } else if (this.state.detailShowing === false) {
      const searchResultLineComponent = [];
      for (
        let p = 0 + (currentPagingStatus - 1) * pagingAmountStatus;
        p < currentPagingStatus * pagingAmountStatus &&
        p < this.state.searchResults.length;
        p += 1
      ) {
        const searchResultLineTemplate = (
          <a
            href={this.state.searchResults[p].URL}
            target='_blank'
            rel='noreferrer'
          >
            <div className='searchResultLineElement'>
              <div className='searchResultLineSymble'>◆ </div>
              <div className='searchResultLinetHeadline'>
                {this.state.searchResults[p].Headline}
              </div>
              <div className='searchResultLinetThirdColumn'>
                <div className='searchResultLineSource'>
                  {this.state.searchResults[p].Source}
                </div>
                <div className='searchResultLineDate'>
                  Date: {this.state.searchResults[p]['Start Date']}
                </div>
              </div>
            </div>
          </a>
        );
        searchResultLineComponent.push(searchResultLineTemplate);
      }
      searchResultComponent = (
        <div
          className={
            'searchResultLineComponent ' +
            searchClassStatus.searchResultComponentClass
          }
          id={'searchResultLineComponent'}
          key={'searchResultComponent'}
        >
          {searchResultLineComponent}
        </div>
      );
    } else if (this.state.detailShowing === true) {
      for (
        let p = 0 + (currentPagingStatus - 1) * pagingAmountStatus;
        p < currentPagingStatus * pagingAmountStatus &&
        p < this.state.searchResults.length;
        p += 1
      ) {
        //Subheadline Processing
        let subheadlineProcessed = 'Subheadline: N/A';
        if (
          this.state.searchResults[p].Subheadline &&
          this.state.searchResults[p].Subheadline !== ''
        ) {
          subheadlineProcessed =
            'Subheadline: ' + this.state.searchResults[p].Subheadline;
        }

        //Author Processing
        let authorProcessed = '';
        if (
          !this.state.searchResults[p].Author ||
          this.state.searchResults[p].Author === ''
        ) {
          authorProcessed = 'Author: N/A';
        } else if (
          this.state.searchResults[p].Author &&
          this.state.searchResults[p].Author !== ''
        ) {
          authorProcessed = `Author: ${this.state.searchResults[
            p
          ].Author.replace('[', '')
            .replace(']', '')
            .replaceAll(',', ', ')}`;
        }

        //Search Result Template
        const searchResultTemplate = (
          <a
            href={this.state.searchResults[p].URL}
            target='_blank'
            rel='noreferrer'
          >
            <div
              className={
                'searchResultComponent ' +
                searchClassStatus.searchResultComponentClass
              }
              id={'searchResultComponent' + p}
              key={'searchResultComponent' + p}
            >
              <div className='searchResultLeft'>
                <img
                  className='searchResultImg'
                  src={
                    require('./img/' +
                      this.state.searchResults[p].Source +
                      '.png').default
                  }
                  alt=''
                ></img>
              </div>
              <div className='searchResultRight'>
                <div className='searchResultHeadline'>
                  {this.state.searchResults[p].Headline}
                </div>
                <div className='searchResultSubheadline'>
                  {subheadlineProcessed}
                </div>
                <div className='searchResultThirdLine'>
                  <div className='searchResultAuthor'>{authorProcessed}</div>
                  <div className='searchResultDate'>
                    Date: {this.state.searchResults[p]['Start Date']}
                  </div>
                </div>
                <div className='searchResultParagraph'>
                  {this.state.searchResults[p]['Lead Paragraph']}
                </div>
              </div>
            </div>
          </a>
        );
        searchResultComponent.push(searchResultTemplate);
      }
    }

    //=====Search Condition Component
    if (
      this.state.searchConditions.length === 0 &&
      this.state.searchClicked === false
    ) {
      searchConditionComponent = (
        <div className='noSearchConditions'>
          Please Input A Search Condition!
        </div>
      );
    } else if (
      this.state.searchConditions.length === 0 &&
      this.state.searchClicked === true
    ) {
      searchConditionComponent = (
        <div className='noSearchConditions'>
          No Search Conditions Inputted Yet!
        </div>
      );
    } else if (this.state.searchConditions.length) {
      for (let i = 0; i < this.state.searchConditions.length; i += 1) {
        let withOrWithoutTemplate;

        //With Or Without Component
        if (
          this.state.searchConditions[i].searchType !== 'Start Date' &&
          this.state.searchConditions[i].searchType !== 'End Date'
        ) {
          let withElement = '';
          let withoutElement = '';
          if (this.state.searchConditions[i].withOrWithout === true) {
            withElement = 'withElement';
            withoutElement = '';
          } else if (this.state.searchConditions[i].withOrWithout === false) {
            withElement = '';
            withoutElement = 'withoutElement';
          }

          withOrWithoutTemplate = (
            <div
              className='withOrWithoutComponent'
              id={'withOrWithoutComponent' + i} //22
              key={'withOrWithoutComponent' + i}
              onClick={this.withOrWithoutYou}
            >
              <div className={'withOrWithoutElement ' + withElement}>
                Include
              </div>
              <div className={'withOrWithoutElement ' + withoutElement}>
                Exclude
                <div class='withExplanation'>{withExplanation}</div>
              </div>
            </div>
          );
        }

        //Search Result Amount Component
        const searchResultAmountTemplate = (
          <div
            className={'searchResultAmountComponent'}
            id={'searchResultAmountComponent' + i} //27
            key={'searchResultAmountComponent' + i}
          >
            {this.state.searchConditions[i].resultAmount}
          </div>
        );

        //Overall Search Conditions
        if (this.state.searchConditions[i].editing === false) {
          const searchConditionTemplate = (
            <Draggable
              draggableId={'draggableId' + i}
              index={i}
              key={'draggableKey' + i}
            >
              {(provided) => (
                <div
                  className='searchConditionComponent'
                  key={'searchConditionComponent' + i}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <div
                    className={
                      'searchConditionLeftColumn ' +
                      searchClassStatus.searchConditionLeftColumn
                    }
                  >
                    {withOrWithoutTemplate}
                  </div>
                  <div className='searchConditionMidColumn'>
                    <div className='searchConditionGroupFirstLine'>
                      <div className='search-left-top searchConditionValue'>
                        {this.state.searchConditions[i].searchValue}
                      </div>
                      <div className='search-right-top searchConditionType'>
                        {this.state.searchConditions[i].searchType}
                      </div>
                    </div>
                    <div className='searchConditionGroupSecondLine'>
                      <button
                        className='search-left-bottom searchConditionEdit'
                        id={'searchConditionEdit' + i} //19
                        onClick={this.editSearchCondition}
                      >
                        Edit
                      </button>
                      <button
                        className='search-right-bottom searchConditionDelete'
                        id={'searchConditionDelete' + i} //21
                        onClick={() => this.deleteSearchCondition(i)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div
                    className={
                      'searchConditionRightColumn ' +
                      searchClassStatus.searchConditionRightColumn
                    }
                  >
                    {searchResultAmountTemplate}
                  </div>
                </div>
              )}
            </Draggable>
          );
          searchConditionComponent.push(searchConditionTemplate);
        } else if (this.state.searchConditions[i].editing === true) {
          const searchConditionEditingTemplate = (
            <div
              className='searchConditionComponent'
              key={'searchConditionComponent' + i}
            >
              <div
                className={
                  'searchConditionLeftColumn ' +
                  searchClassStatus.searchConditionLeftColumn
                }
              >
                {withOrWithoutTemplate}
              </div>
              <div className='searchConditionMidColumn'>
                <div className='searchConditionGroupFirstLine'>
                  <input
                    className='search-left-top searchInput'
                    id={'inputNewSearchKeyword' + i} //21
                    onChange={this.inputNewSearchKeyword}
                    value={this.state.searchConditions[i].searchValueEditing}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        this.saveSearchCondition(e);
                      }
                    }}
                  ></input>
                  <select
                    className='search-right-top searchSelect'
                    id={'changeNewSearchOption' + i} //21
                    onChange={this.changeNewSearchOption}
                    value={this.state.searchConditions[i].searchTypeEditing}
                  >
                    <option>Headline</option>
                    <option>Subheadline</option>
                    <option>Author</option>
                    <option>Text</option>
                    <option>Start Date</option>
                    <option>End Date</option>
                  </select>
                </div>
                <div className='searchConditionGroupSecondLine'>
                  <button
                    className='search-left-bottom searchConditionSave'
                    id={'searchConditionSave' + i} //19
                    onClick={(e) => {
                      this.saveSearchCondition(e);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className='search-right-bottom searchConditionCancelEditing'
                    id={'searchConditionCancelEditing' + i} //28
                    onClick={this.cancelEditingCondition}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div
                className={
                  'searchConditionRightColumn ' +
                  searchClassStatus.searchConditionRightColumn
                }
              ></div>
            </div>
          );
          searchConditionComponent.push(searchConditionEditingTemplate);
        }
      }
    }

    //=====Search Result All Component
    if (this.state.searchClicked === false) {
      searchResultAllComponent = (
        <div
          className={'searchResultGroup ' + searchClassStatus.searchResultGroup}
        ></div>
      );
    } else if (this.state.searchClicked === true) {
      const resultOrderStaus = this.state.resultOrder;
      let orderSearchCondition,
        orderDate,
        arrowUp,
        arrowDown = '';
      if (resultOrderStaus === 'orderSearchCondition') {
        orderSearchCondition = 'currentResultOrderOption';
      } else {
        orderDate = 'currentResultOrderOption';
        if (resultOrderStaus === 'arrowUp') {
          arrowUp = 'currentArrowUp';
        } else if (resultOrderStaus === 'arrowDown') {
          arrowDown = 'currentArrowDown';
        }
      }

      const detailShowingTrue =
        this.state.detailShowing === true ? 'currentDetailShowing' : '';
      const detailShowingFalse =
        this.state.detailShowing === false ? 'currentDetailShowing' : '';

      searchResultAllComponent = (
        <div
          className={'searchResultGroup ' + searchClassStatus.searchResultGroup}
        >
          <div className='searchResultCatalogue'>
            <div className='resultOrder'>
              <div className='resultOrderTitle'>Order By:</div>
              <div
                className={'resultOrderOption ' + orderSearchCondition}
                onClick={(e) => {
                  this.changeResultOrder(e);
                }}
                id='orderSearchCondition'
              >
                Condition
              </div>
              <div
                className={'resultOrderOption ' + orderDate}
                onClick={(e) => {
                  this.changeResultOrder(e);
                }}
                id='orderDate'
              >
                Date
                <div className='orderingArrow'>
                  <div className={'arrowUp ' + arrowUp}></div>
                  <div className={'arrowDown ' + arrowDown}></div>
                </div>
              </div>
            </div>

            {pagingComponent}

            <div className='pagingAmount'>
              <div className='pagingAmountTitle'>Results/page: </div>
              <select
                className='pagingAmountSelect'
                onChange={this.changePagingAmount}
                value={this.state.pagingAmount}
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>All</option>
              </select>
            </div>
            <div className='resultDisplay'>
              <img
                className={'resultDisplayComponent ' + detailShowingTrue}
                src={block}
                onClick={() => {
                  this.changeDetailShowing(true);
                }}
                alt=''
              ></img>
              <img
                className={'resultDisplayComponent ' + detailShowingFalse}
                src={line}
                onClick={() => {
                  this.changeDetailShowing(false);
                }}
                alt=''
              ></img>
            </div>
          </div>
          {searchResultComponent}
        </div>
      );
    }

    /*==============================
    =============Return=============
    ==============================*/
    return (
      <div className='all'>
        <header>
          <a href={homePageUrl}>
            <img className='logoImg' src={logo} alt='' />
          </a>
          <div className='headerLinkGroup'>
            <a href={homePageUrl}>
              <div className='headerLink'> Home</div>
            </a>
            <a href='mailto:tj920419@gmail.com'>
              <div className='headerLink'>Contact Us</div>
            </a>
          </div>
        </header>
        <DragDropContext
          onDragEnd={(result) => {
            const { source, destination } = result;
            if (
              !destination ||
              (destination.droppableId === source.droppableId &&
                destination.index === source.index)
            ) {
              return;
            }
            const arr = Array.from(this.state.searchConditions);
            const [remove] = arr.splice(source.index, 1);
            arr.splice(destination.index, 0, remove);
            this.checkConditionFiltering(arr);
          }}
        >
          <main>
            <img className='background' src={background} alt=''></img>
            <div className={'mainLeft ' + searchClassStatus.mainLeft}>
              <div className={'searchAll ' + searchClassStatus.searchAll}>
                <Droppable droppableId='droppableId'>
                  {(provided) => (
                    <div
                      className={
                        'searchAllTop ' + searchClassStatus.searchAllTop
                      }
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className='setGroup'>{setComponent}</div>
                      <div className='searchConditionGroup'>
                        {searchConditionComponent}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className={'searchGroup ' + searchClassStatus.searchGroup}>
                  <div
                    className={
                      'searchGroupFirstLine ' +
                      searchClassStatus.searchGroupFirstLine
                    }
                  >
                    <input
                      className='searchInput'
                      onChange={this.inputSearchKeyword}
                      placeholder={this.state.newSearchPlaceHolder}
                      value={this.state.newSearchValue}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          this.clickAddNewSearchButton();
                        }
                      }}
                    ></input>
                    <select
                      className='searchSelect'
                      onChange={this.changeSearchOption}
                    >
                      <option>Headline</option>
                      <option>Subheadline</option>
                      <option>Author</option>
                      <option>Text</option>
                      <option>Start Date</option>
                      <option>End Date</option>
                    </select>
                  </div>

                  {buttonComponent}
                  <div className='searchGroupThirdLine'>
                    {mediaBrandComponent}
                  </div>
                </div>
              </div>
            </div>
            <div className={'mainRight ' + searchClassStatus.mainRight}>
              {searchResultAllComponent}
            </div>
          </main>
        </DragDropContext>
        <footer>
          <div className='footerText'>© 2020. All rights reserved.</div>
        </footer>
        <div class={loadingImgClass}>
          <img src={loadingGif} className='loadingGif' alt='' />
        </div>
        <div class={alertObjectClass}>
          <div class='alertGroup'>
            <div class='alertFirstLine'>
              <div class='alertText'>{this.state.alert}</div>
            </div>
            <div class='alertSecondLine'>
              <button class='alertButton' onClick={this.alertClick}>
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

window.addEventListener('load', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

export default App;

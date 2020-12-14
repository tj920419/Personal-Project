import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import { firestore } from './firebase.js';
import logo from './img/Logo.png';
import block from './img/Block.png';
import line from './img/Line.png';
import background from './img/Background_Earth.jpg';
import { DragDropContext } from 'react-beautiful-dnd';
import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';

let searchClassStatus = {};
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
    this.runConditionFiltering = this.runConditionFiltering.bind(this);
    this.checkConditionFiltering = this.checkConditionFiltering.bind(this);
    //Edit Search Condiiton
    this.withOrWithoutYou = this.withOrWithoutYou.bind(this);
    this.editSearchCondition = this.editSearchCondition.bind(this);
    this.deleteSearchCondition = this.deleteSearchCondition.bind(this);
    this.inputNewSearchKeyword = this.inputNewSearchKeyword.bind(this);
    this.changeNewSearchOption = this.changeNewSearchOption.bind(this);
    this.editSearchCondition = this.editSearchCondition.bind(this);
    this.deleteSearchCondition = this.deleteSearchCondition.bind(this);
    this.saveSearchCondition = this.saveSearchCondition.bind(this);
    this.cancelEditingCondition = this.cancelEditingCondition.bind(this);
    //Check Media Brand
    this.checkMediaBrand = this.checkMediaBrand.bind(this);
    //State
    this.state = {
      setStatus: true,
      mediaBrand: [
        { brandName: 'The New York Times', checked: true, newsAcquired: [] },
        { brandName: 'The Economist', checked: true, newsAcquired: [] },
        { brandName: 'Financial Times', checked: false, newsAcquired: [] },
      ],
      searchConditions: [
        // {
        //   withOrWithout: true,
        //   searchValue: 'Trump',
        //   searchType: 'Headline',
        //   editing: false,
        //   searchValueEditing: 'Trump',
        //   searchTypeEditing: 'Headline',
        //   resultAmount: 0,
        // },
      ],
      newSearchType: 'Headline',
      newSearchValue: '',
      newSearchPlaceHolder: 'Please Input Your Keyword!',
      articlesAcquired: [],
      // mediaAcquired: [],
      searchResults: [],
      searchClicked: false,
    };
  }

  /*==============================
  ============Functions===========
  ==============================*/
  /*Set Search Condition*/
  changeSet() {
    let newSetStatus = !this.state.setStatus;
    this.checkConditionFiltering(null, newSetStatus);
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
      alert('Not yet input anything!');
    } else {
      if (
        this.state.newSearchType === 'Start Date' ||
        this.state.newSearchType === 'End Date'
      ) {
        alert('Date Detector Required'); //Unfinished
      }
      let newSearchCondition = {
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
    if (this.state.searchClicked === true) {
      return;
    }

    if (this.state.searchConditions.length === 0) {
      alert('Please input at least one search condition!');
    } else {
      let promiseElement = [];
      let aquiredResult = [];
      let mediaBrandStatus = JSON.parse(JSON.stringify(this.state.mediaBrand));
      let getData = (sent) => {
        return firestore.collection(sent).get();
      };

      for (let m = 0; m < mediaBrandStatus.length; m += 1) {
        // if (this.state.mediaBrand[m].checked === true) {
        promiseElement.push(getData(mediaBrandStatus[m].brandName));
        // }
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
        });
        this.runConditionFiltering(aquiredResult);
      });
    }
  }

  runConditionFiltering(aquiredresult, arr, set) {
    let finalResult = [];
    let searchTypeNumberN;
    let searchConditions;
    let setStatus;
    let searchresult = JSON.parse(JSON.stringify(aquiredresult));

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

    if (arr) {
      searchConditions = arr;
    } else {
      searchConditions = this.state.searchConditions;
    }

    if (set !== undefined) {
      setStatus = set;
    } else {
      setStatus = this.state.setStatus;
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
            let dateIndex = parseInt(searchresult[o][searchTypeNumberN]);
            let dateIndexCondition = parseInt(searchConditions[n].searchValue);
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
            let dateIndex = parseInt(searchresult[o][searchTypeNumberN]);
            let dateIndexCondition = parseInt(searchConditions[n].searchValue);

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
    this.setState({
      searchResults: finalResult,
      searchConditions: searchConditions,
      setStatus: setStatus,
      articlesAcquired: aquiredresult,
      // mediaAcquired: JSON.parse(JSON.stringify(this.state.mediaBrand)),
    });
  }

  checkConditionFiltering(arr, set) {
    let aquiredResult = JSON.parse(JSON.stringify(this.state.articlesAcquired));
    this.runConditionFiltering(aquiredResult, arr, set);
  }

  /*Edit Search Condiiton*/
  withOrWithoutYou(e) {
    let yourIndex = parseInt(e.currentTarget.id.slice(22));
    let stateStatus = this.state.searchConditions;
    stateStatus[yourIndex].withOrWithout = !stateStatus[yourIndex]
      .withOrWithout;
    this.checkConditionFiltering(stateStatus);
  }

  editSearchCondition(e) {
    let editIndex = parseInt(e.target.id.slice(19));
    let stateStatus = this.state.searchConditions;
    stateStatus[editIndex].editing = true;
    this.setState({ searchConditions: stateStatus });
  }

  deleteSearchCondition(e) {
    let deleteIndex = parseInt(e.target.id.slice(21));
    let stateStatus = this.state.searchConditions;
    stateStatus.splice(deleteIndex, 1);
    this.checkConditionFiltering(stateStatus);
  }

  inputNewSearchKeyword(e) {
    let inputIndex = parseInt(e.target.id.slice(21));
    let stateStatus = this.state.searchConditions;
    stateStatus[inputIndex].searchValueEditing = e.target.value;
    this.setState({ searchConditions: stateStatus });
  }

  changeNewSearchOption(e) {
    let selectIndex = parseInt(e.target.id.slice(21));
    let stateStatus = this.state.searchConditions;
    stateStatus[selectIndex].searchTypeEditing = e.target.value;
    this.setState({ searchConditions: stateStatus });
  }

  saveSearchCondition(e) {
    let saveIndex = parseInt(e.target.id.slice(19));
    let stateStatus = this.state.searchConditions;
    stateStatus[saveIndex].searchValue = this.state.searchConditions[
      saveIndex
    ].searchValueEditing;
    stateStatus[saveIndex].searchType = this.state.searchConditions[
      saveIndex
    ].searchTypeEditing;
    stateStatus[saveIndex].editing = false;
    this.checkConditionFiltering(stateStatus);
  }

  cancelEditingCondition(e) {
    let cancelIndex = parseInt(e.target.id.slice(28));
    let stateStatus = this.state.searchConditions;
    stateStatus[cancelIndex].editing = false;
    stateStatus[cancelIndex].searchValueEditing =
      stateStatus[cancelIndex].searchValue;
    stateStatus[cancelIndex].searchTypeEditing =
      stateStatus[cancelIndex].searchType;
    this.setState({ searchConditions: stateStatus });
  }

  /*Check Media Brand*/
  checkMediaBrand(e) {
    let mediaBrandStatus = this.state.mediaBrand;
    // let mediaAcquiredStatus = this.state.mediaAcquired;
    let articlesAcquiredStatus = JSON.parse(
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

  /*==============================
  =============Render=============
  ==============================*/

  render() {
    console.log(this.state);
    let setComponent = [];
    let mediaBrandComponent = [];
    let searchResultComponent = [];
    let searchConditionComponent = [];
    let searchResultAllComponent = [];
    const homePageUrl = 'http://localhost:3000/Personal-Project';

    if (this.state.searchResults.length > 0) {
      console.log('Search Activated!');
      searchClassStatus = {
        searchAll: 'searchAllAfter',
        searchResultGroup: 'searchResultGroupAfter',
        matchTitle: 'matchTitleAfter',
        searchConditionLeftColumn: 'searchConditionLeftColumnAfter',
        searchConditionRightColumn: 'searchConditionRightColumnAfter',
        mediaBrandComponentClass: 'mediaBrandComponentAfter',
        mainLeft: 'mainLeftAfter',
        mainRight: 'mainRightAfter',
        searchResultComponentClass: 'searchResultComponentAfter',
      };
    }

    //Set Component
    if (this.state.searchConditions.length > 0) {
      let andElement = '';
      let orElement = '';
      if (this.state.setStatus === true) {
        andElement = 'andElement';
        orElement = '';
      } else if (this.state.setStatus === false) {
        andElement = '';
        orElement = 'orElement';
      }
      let setTemplate = (
        <div
          className='setComponent'
          key={'setComponent0'}
          style={{ display: 'flex' }}
        >
          <div style={{ flex: 4.9 }}></div>
          <div
            className={'setElement ' + andElement}
            onClick={() => {
              this.changeSet();
            }}
            style={{ flex: 1 }}
          >
            And
          </div>
          <div
            className={'setElement ' + orElement}
            onClick={() => {
              this.changeSet();
            }}
            style={{ flex: 1 }}
          >
            Or
          </div>
          <div style={{ flex: 3.1 }}></div>
          <div
            className={'matchTitle ' + searchClassStatus.matchTitle}
            style={{ flex: 3 }}
          >
            Amount of Matches <br></br>(accumulative)
          </div>
        </div>
      );
      setComponent.push(setTemplate);
    }

    //Media Brand Component
    for (let k = 0; k < this.state.mediaBrand.length; k += 1) {
      let mediaBrandTemplate = (
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

    //Search Result Component
    if (this.state.searchResults.length === 0) {
      let searchResultTemplate = (
        <div className='noSearchResult'>Currently No Search Result!</div>
      );
      searchResultComponent.push(searchResultTemplate);
    } else {
      for (let p = 0; p < this.state.searchResults.length; p += 1) {
        //Author Processing
        let authorProcessed = '';
        if (this.state.searchResults[p].Author) {
          authorProcessed = `
      Author: ${this.state.searchResults[p].Author.replace('[', '')
        .replace(']', '')
        .replaceAll(',', ', ')}`;
        }

        //Search Result Template
        let searchResultTemplate = (
          <div
            className={
              'searchResultComponent ' +
              searchClassStatus.searchResultComponentClass
            }
            id={'searchResultComponent' + p}
            key={'searchResultComponent' + p}
          >
            <a
              href={this.state.searchResults[p].URL}
              target='_blank'
              rel='noreferrer'
            >
              <img
                className='searchResultImg'
                src={
                  require('./img/' +
                    this.state.searchResults[p].Source +
                    '.png').default
                }
                alt=''
              ></img>

              <div className='searchResultFirstLine'>
                <div className='searchResultSubheadline'>
                  {this.state.searchResults[p].Subheadline}
                </div>
                <div className='searchResultDate'>
                  Date: {this.state.searchResults[p]['Start Date']}
                </div>
              </div>

              <div className='searchResultSecondLine'>
                <div className='searchResultHeadline'>
                  {this.state.searchResults[p].Headline}
                </div>
                <div className='searchResultAuthor'>{authorProcessed}</div>
              </div>

              <div className='searchResultThirdLine'>
                <div className='searchResultParagraph'>
                  {this.state.searchResults[p]['Lead Paragraph']}
                </div>
              </div>
            </a>
          </div>
        );
        searchResultComponent.push(searchResultTemplate);
      }
    }

    //Search Condition Component
    if (
      this.state.searchConditions.length === 0 &&
      this.state.searchClicked === false
    ) {
      searchConditionComponent = (
        <div className='noSearchConditions'>
          Please Inputted Search Condition!
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
      // this.state.searchConditions.map((item, index) => {});
      for (let i = 0; i < this.state.searchConditions.length; i += 1) {
        let withOrWithoutTemplate;
        let searchResultAmountTemplate;

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
              <div className={'withOrWithoutElement ' + withElement}>With</div>
              <div className={'withOrWithoutElement ' + withoutElement}>
                Without
              </div>
            </div>
          );
        }

        //Search Result Amount Component
        searchResultAmountTemplate = (
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
          let searchConditionTemplate = (
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
                        onClick={this.deleteSearchCondition}
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
          console.log(this.state.searchConditions[i]);
          let searchConditionEditingTemplate = (
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

    //Overall Search Conditions
    if (this.state.searchClicked === false) {
      searchResultAllComponent = (
        <div
          className={'searchResultGroup ' + searchClassStatus.searchResultGroup}
        ></div>
      );
    } else if (this.state.searchClicked === true) {
      searchResultAllComponent = (
        <div
          className={'searchResultGroup ' + searchClassStatus.searchResultGroup}
        >
          <div className='searchResultCatalogue'>
            <div className='resultOrder'>
              <div className='resultOrderTitle'>Order By:</div>
              <div className='resultOrderOption'>Date</div>
              <div className='resultOrderOption'>Search Condition</div>
            </div>
            <div className='resultPaging'>
              <div className='resultPagingOption'></div>
              <div className='resultPagingOption'>1</div>
              <div className='resultPagingOption'>2</div>
              <div className='resultPagingOption'>3</div>
              <div className='resultPagingOption'>4</div>
              <div className='resultPagingOption'>5</div>
              <div className='resultPagingOption'></div>
            </div>
            <div className='resultDisplay'>
              <img className='resultDisplayComponent' src={block} alt=''></img>
              <img className='resultDisplayComponent' src={line} alt=''></img>
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
            <div className='headerLink'>
              Data
              <br />
              Visualization
            </div>
            <div className='headerLink'>Membership</div>
            <div className='headerLink'>Contact Us</div>
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
            let arr = Array.from(this.state.searchConditions);
            let [remove] = arr.splice(source.index, 1);
            arr.splice(destination.index, 0, remove);
            this.checkConditionFiltering(arr);
          }}
        >
          <main>
            <img className='background' src={background}></img>
            <div className={'mainLeft ' + searchClassStatus.mainLeft}>
              <div className={'searchAll ' + searchClassStatus.searchAll}>
                <Droppable droppableId='droppableId'>
                  {(provided) => (
                    <div
                      className='searchAllTop'
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

                <div className='searchGroup'>
                  <div className='searchGroupFirstLine'>
                    <input
                      className='searchInput'
                      onChange={this.inputSearchKeyword}
                      placeholder={this.state.newSearchPlaceHolder}
                      value={this.state.newSearchValue}
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
                  <div className='searchGroupSecondLine'>
                    <button
                      className='addNewSearchButton'
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
      </div>
    );
  }
}

window.addEventListener('load', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

export default App;

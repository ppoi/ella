'use strict';

import session from "~/app/core/session";

/**
 * 
 * @param {string} path 
 * @param {Object<string, (string|Object<string, string>)} options 
 * @returns {Promise<Document>}
 */
function cgssApi(path, options) {
  return new Promise((resolve, reject)=>{
    session.callApi(path, options).then(res=>{
      if(res.ok) {
        return res.text();
      } else {
        reject({
          type: 'api',
          reason: `unespected response. status=${res.status}`
        });
      }
    }).then(body=>{
      resolve(new DOMParser().parseFromString(body, 'text/html'));
    }).catch(e=>{
      reject(e);
    })
  })
}

/**
 * @returns {Promise}
 */
function fetchIdols() {
  return new Promise((resolve, reject)=>{
    cgssApi('/cgss/chara').then(doc=>{
      let list = doc.querySelectorAll('ul.dblst li a[href][title]');
      let items = Array.from(list).map(entry=>{
        return {
          id: parseInt(entry.attributes['href'].value.split('/').pop()),
          name: entry.attributes['title'].value
        };
      });
      resolve(items);
    }).catch(reject);
  });
}

function fetchIdolDetail(chara) {
  return new Promise((resolve, reject)=>{
    cgssApi(`/cgss/chara/${chara.id}`).then(doc=>{
      let articles = doc.querySelectorAll('h2+article');
      // プロフィール
      let profileItems = Array.from(articles[1].querySelectorAll('li.d'));
      chara.name_kana = profileItems[0].textContent.trim();
      // カードリスト
      let cardList = Array.from(articles[3].querySelectorAll('ul.dblst li a[href][title]'));
      chara.cards = cardList.reduce((cards, elm)=>{
        let match = new RegExp(`/card/detail/(\\d+)/(\\d+)`).exec(elm.attributes['href'].value);
        let cardId = Math.trunc(Number(match[1]));
        let card = cards.find(i=>i.id == cardId);
        if(card == null) {
          card = {id: cardId, title: elm.attributes['title'].value, variants: []};
          cards.push(card);
        }
        let variantId = Math.trunc(Number(match[2]));
        let variant = card.variants.find(i=>i.id == variantId);
        if(variant == null) {
          variant = {id: variantId, thumbnail: elm.querySelector('img').dataset['original']}
          card.variants.push(variant);
        }
        return cards;
      }, chara.cards || []);
      resolve(chara);
    }).catch(reject);
  });
}

export {
  fetchIdols,
  fetchIdolDetail
};
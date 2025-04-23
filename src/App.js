import React from 'react'
import './App.css'
import { CATEGORIES } from './categories'

const DURATION_ANIMATE = 250
const DURATION_READ = 7000
const COUNT_VARIANT = 3

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        categorySubtitle: '',
        categoryDisplay: '',
        categoryAnimate: '',
        headlineDisplay: '',
        headlineAnimate: '',
        cache: {},
        cacheImages: [],
      }
      this.settings = []
      this.order = []
    }

    breakdown(line, THRESHOLD) {
      const lines = []
      const imgRegExp = /scgbimage_(.*?)_(\d+)_ecgbimage/g
      const matches = (line || '').match(imgRegExp)
      let tempLine = (line || '').replace(imgRegExp, '_$2_') || ''
      while (tempLine.length > 0) {
        if (tempLine.length < THRESHOLD) {
          if (matches) {
            tempLine = tempLine.split(/_(\d+)_/g)
            for (let i = 1; i < tempLine.length; i += 2) {
              let data = matches[tempLine[i]].replace(imgRegExp, '$1').split('|srcClassSep|')
              let src = data[0]
              let imgClass = data[1]
              let img = <div className={`${imgClass} ${this.state.headlineAnimate}`} key={i} style={{backgroundImage: `url(${'http://opt.moovweb.net/img?img='}${encodeURIComponent(src)})`}} />
              tempLine[i] = img
              if (!this.state.cache[src]) {
                this.setState({
                  cache: {
                    ...this.state.cache,
                    [src]: true
                  },
                  cacheImages: [
                    ...this.state.cacheImages,
                    React.cloneElement(img, { key: src })
                  ]
                })
              }
            }
          }
          lines.push(<span>{tempLine}</span>)
          tempLine = ""
        } else {
          let index = tempLine.substr(0, THRESHOLD).lastIndexOf(' ')
          let partialLine = tempLine.substr(0, index)
          if (matches) {
            partialLine = partialLine.split(/_(\d+)_/g)
            for (let i = 1; i < partialLine.length; i += 2) {
              let data = matches[partialLine[i]].replace(imgRegExp, '$1').split('|srcClassSep|')
              let src = data[0]
              let imgClass = data[1]
              let img = <div className={`${imgClass} ${this.state.headlineAnimate}`} key={i} style={{backgroundImage: `url(${'http://opt.moovweb.net/img?img='}${encodeURIComponent(src)})`}} />
              partialLine[i] = img
              if (!this.state.cache[src]) {
                this.setState({
                  cache: {
                    ...this.state.cache,
                    [src]: true
                  },
                  cacheImages: [
                    ...this.state.cacheImages,
                    React.cloneElement(img, { key: src })
                  ]
                })
              }
            }
            partialLine.push(' ...')
          } else {
            partialLine += ' ...'
          }
          lines.push(<span>{partialLine}</span>)
          tempLine = `...${tempLine.substr(index)}`
        }
      }
      return lines
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    async nextHeadline({ newsIndex, variantIndex }) {
      const rawSettingsResponse = await fetch(`${'http://'}${process.env.REACT_APP_HOST}/settings.json`)
      const settings = await rawSettingsResponse.json()
      let flag = true
      let updatedNewsIndex
      for (let setting in settings) {
        if (settings.hasOwnProperty(setting) && settings[setting] !== this.settings[setting]) {
          flag = false
          break
        }
      }
      if (!flag) {
        this.settings = settings
        this.order = []
        for (let setting in settings) {
          if (settings.hasOwnProperty(setting) && settings[setting]) {
            this.order = this.order.concat(CATEGORIES[setting])
          }
        }
        newsIndex = 0
        updatedNewsIndex = 1
      } else {
        updatedNewsIndex = (newsIndex + 1) % this.order.length
      }
      const entry = this.order[newsIndex]
      const { stat, rotatingVariants, variant  } = entry
      const updatedVariantIndex = updatedNewsIndex === 0 ? (variantIndex + 1) % COUNT_VARIANT : variantIndex
      let line
      try {
        const rawApiResponse = await fetch(`${'http://'}${process.env.REACT_APP_HOST}/${this.order[newsIndex].type}.json`)
        const apiResponse = await rawApiResponse.json()
        if (Object.keys(apiResponse).length === 0 && apiResponse.constructor === Object) {
          console.log('** Empty object response presumably from error fetching API endpoint')
          return this.nextHeadline({
            newsIndex: updatedNewsIndex,
            variantIndex: updatedVariantIndex,
          })
        }
        if (entry.rotatingVariants) {
          line = apiResponse[`output_${stat}`][rotatingVariants[variantIndex]]
        } else if (entry.variant) {
          line = apiResponse[`output_${stat}`][variant]
        } else {
          line = apiResponse[`output_${stat}`]
        }
      } catch(e) {
        console.log('** Error fetching from API endpoint', e)
      }
      const lines = this.breakdown(line, 70) // 70 big goal, 115 without goal
      const loopLines = async (linesArray) => {
        if (linesArray.length) {
          const displayLine = linesArray.shift()
          await this.sleep(DURATION_READ)
          this.setState({
            headlineAnimate: 'slide',
          })
          await this.sleep(DURATION_ANIMATE)
          this.setState({
            headlineAnimate: '',
            categorySubtitle: entry.subtitle,
            categoryDisplay: entry.stat,
            headlineDisplay: displayLine,
          })
          if (displayLine) {
            loopLines(linesArray)
          }
        } else {
          await this.sleep(DURATION_READ)
          this.nextHeadline({
            newsIndex: updatedNewsIndex,
            variantIndex: updatedVariantIndex,
          })
        }
      }
      this.setState({
        categoryAnimate: this.state.categoryDisplay !== entry.stat ? 'slide' : '',
        headlineAnimate: 'fade'
      })
      await this.sleep(DURATION_ANIMATE)
      this.setState({
        categoryAnimate: '',
        headlineAnimate: '',
        categorySubtitle: entry.subtitle,
        categoryDisplay: entry.stat,
        headlineDisplay: lines.shift()
      })
      await loopLines(lines)
    }

    async componentDidMount() {
      await this.nextHeadline({
        newsIndex: 0,
        variantIndex: 0
      })
    }

    translateCategory(rawCat) {
      const dict = {
        'currentlyPlaying': 'Playing',
      }
      return dict[rawCat] || rawCat
    }

    getImage(rawCat) {
      const dict = {
        'build': '/tapes-purple-2x.jpg',
        'followers': '/octo-red-2x.png',
        'subscribers': '/circles-green-2x.png',
        'bits': '/camo-green-2x.png',
        '!chrissucks': '/octoarrow-orange-2x.png',
        'giveaway': '/camo-purple-2x.png',
        'uptime': '/camo-red-2x.png',
        'currentlyPlaying': '/stripes--green.png',
        'splatoon': '/triangles--pink.png',
        'acnh': '/pattern-leaves-turquoise-2x.jpg',
        // unused: gear-up-bg.png, stars--blue.png
      }
      return dict[rawCat]
    }

    render() {
      const {
        categorySubtitle,
        categoryDisplay,
        categoryAnimate,
        headlineDisplay,
        headlineAnimate,
        cacheImages
      } = this.state
      return (
        <div className="ticker">
          <div className={`category ${categoryAnimate}`} style={{ backgroundImage: `url('${this.getImage(categoryDisplay)}')` }}>
            <div className="subtitle">{categorySubtitle}</div>
            <div className="title">{this.translateCategory(categoryDisplay)}</div>
          </div>
          <div className={`headline ${headlineAnimate}`}>
            {headlineDisplay}
          </div>
          <div className="cache">
            {cacheImages}
          </div>
        </div>
      )
    }
}

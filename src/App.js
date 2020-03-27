import React from 'react';
import './App.css';

const DURATION_ANIMATE = 250
const DURATION_READ = 7000
const COUNT_VARIANT = 3
const SPOTIFY = true
const DEFAULTS = true
const SPLATOON_SOLOQ = false
const SPLATOON_LEAGUE = false
const SPLATOON_SALMON = false
const ACNH = false

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        categoryDisplay: '',
        categoryAnimate: '',
        headlineDisplay: '',
        headlineAnimate: '',
      }
      this.order = []
      if (SPOTIFY) {
        this.order.push({ type: 'spotify', stat: 'currentlyPlaying' })
      }
      if (DEFAULTS) {
        this.order = this.order.concat([
          { type: 'twitch', stat: 'followers' },
          { type: 'twitch', stat: 'subs' },
          { type: 'twitch', stat: 'bits', rotatingVariants: ['alltime', 'month', 'week'] },
          { type: 'internal-stats', stat: 'chrissucks', rotatingVariants: ['alltime', 'month', 'week'] },
          { type: 'internal-stats', stat: 'charity' },
          { type: 'internal-stats', stat: 'uptime' },
        ])
      }
      if (ACNH) {
        this.order = this.order.concat([
          { type: 'acnh', stat: 'neighbors' },
          { type: 'acnh', stat: 'player' },
          { type: 'acnh', stat: 'island' }
        ])
      }
      if (SPLATOON_SOLOQ) {
        this.order = this.order.concat([
          { type: 'splatoon', stat: 'ranks' },
          { type: 'splatoon', stat: 'gear', variant: 'weapon' },
          { type: 'splatoon', stat: 'gear', variant: 'head' },
          { type: 'splatoon', stat: 'gear', variant: 'clothes' },
          { type: 'splatoon', stat: 'gear', variant: 'shoes' },
          { type: 'splatoon', stat: 'lifetimeWL' },
          { type: 'splatoon', stat: 'weaponStats', rotatingVariants: ['wins', 'ratio', 'turf'] },
          { type: 'splatoon', stat: 'weaponStats', rotatingVariants: ['losses', 'games', 'recent'] }
        ])
      }
      if (SPLATOON_LEAGUE) {
        this.order = this.order.concat([
          { type: 'splatoon', stat: 'league', variant: 'pair' },
          { type: 'splatoon', stat: 'league', variant: 'team' },
          { type: 'splatoon', stat: 'gear', variant: 'weapon' },
          { type: 'splatoon', stat: 'gear', variant: 'head' },
          { type: 'splatoon', stat: 'gear', variant: 'clothes' },
          { type: 'splatoon', stat: 'gear', variant: 'shoes' },
          { type: 'splatoon', stat: 'lifetimeWL' },
        ])
      }
      if (SPLATOON_SALMON) {
        this.order = this.order.concat([
          { type: 'splatoon', stat: 'salmonRun', variant: 'overall' },
          { type: 'splatoon', stat: 'salmonRun', variant: 'individual' },
        ])
      }
    }

    breakdown(line, THRESHOLD) {
      const lines = []
      const imgRegExp = /scgbimage_(.*?)_(\d+)_ecgbimage/g
      const matches = (line || '').match(imgRegExp)
      let tempLine = (line || '').replace(imgRegExp, '_$2_') || ''
      while (tempLine.length > 0) {
        const title = (tempLine.match(/(\[.*?\] )(.*)/) || [])[1]
        if (tempLine.length < THRESHOLD) {
          if (matches) {
            tempLine = tempLine.split(/_(\d+)_/g)
            for (let i = 1; i < tempLine.length; i += 2) {
              let data = matches[tempLine[i]].replace(imgRegExp, '$1').split('|srcClassSep|')
              let src = data[0]
              let imgClass = data[1]
              tempLine[i] = <div className={`${imgClass} ${this.state.headlineAnimate}`} key={i} style={{backgroundImage: `url(${'http://opt.moovweb.net/img?img='}${encodeURIComponent(src)})`}} />
            }
          }
          lines.push(<span>{tempLine}</span>)
          tempLine = ""
        } else {
          let index = tempLine.substr(0, THRESHOLD).lastIndexOf(' ')
          if (index < title.length + 7) {
            index = THRESHOLD
          }
          let partialLine = tempLine.substr(0, index)
          if (matches) {
            partialLine = partialLine.split(/_(\d+)_/g)
            for (let i = 1; i < partialLine.length; i += 2) {
              let data = matches[partialLine[i]].replace(imgRegExp, '$1').split('|srcClassSep|')
              let src = data[0]
              let imgClass = data[1]
              partialLine[i] = <div className={`${imgClass} ${this.state.headlineAnimate}`} key={i} style={{backgroundImage: `url(${'http://opt.moovweb.net/img?img='}${encodeURIComponent(src)})`}} />
            }
            partialLine.push(' ...')
          } else {
            partialLine += ' ...'
          }
          lines.push(<span>{partialLine}</span>)
          tempLine = `${title}...${tempLine.substr(index)}`
        }
      }
      return lines
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    async nextHeadline({ newsIndex, variantIndex }) {
      const entry = this.order[newsIndex]
      const { stat, rotatingVariants, variant  } = entry
      const updatedNewsIndex = (newsIndex + 1) % this.order.length
      const updatedVariantIndex = updatedNewsIndex === 0 ? (variantIndex + 1) % COUNT_VARIANT : variantIndex
      let line
      try {
        const rawApiResponse = await fetch(`${'http://localhost:3000/'}${this.order[newsIndex].type}.json`)
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
      const lines = this.breakdown(line, 115)
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
            categoryDisplay: entry.type,
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
        categoryAnimate: this.state.categoryDisplay !== entry.type ? 'slide' : '',
        headlineAnimate: 'fade'
      })
      await this.sleep(DURATION_ANIMATE)
      this.setState({
        categoryAnimate: '',
        headlineAnimate: '',
        categoryDisplay: entry.type,
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
        'internal-stats': '@cgbuen',
        'spotify': 'music',
        'twitch': '@cgbuen',
      }
      return dict[rawCat] || rawCat
    }

    getImage(rawCat) {
      const dict = {
        'internal-stats': '/gear-up-bg.png',
        'splatoon': '/triangles--pink.png',
        'acnh': '/pattern-leaves-turquoise-2x.jpg',
        'twitch': '/gear-up-bg.png',
        'spotify': '/stripes--green.png'
      }
      return dict[rawCat]
    }

    render() {
      const {
        categoryDisplay,
        categoryAnimate,
        headlineDisplay,
        headlineAnimate
      } = this.state
      return (
        <div className="ticker">
          <div className={`category ${categoryAnimate}`} style={{ backgroundImage: `url('${this.getImage(categoryDisplay)}')` }}>
            {this.translateCategory(categoryDisplay)}
          </div>
          <div className={`headline ${headlineAnimate}`}>
            {headlineDisplay}
          </div>
        </div>
      )
    }
}

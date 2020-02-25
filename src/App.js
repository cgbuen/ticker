import React from 'react';
import './App.css';

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        categoryDisplay: '',
        headlineDisplay: '',
        newsIndex: 0,
        variantIndex: 0
      }
      this.order = [
        { type: 'spotify', stat: 'currentlyPlaying' },
        { type: 'twitch', stat: 'followers' },
        { type: 'twitch', stat: 'subs' },
        { type: 'twitch', stat: 'bits', rotatingVariants: ['alltime', 'month', 'week'] },
        { type: 'internal-stats', stat: 'chrissucks', rotatingVariants: ['alltime', 'month', 'week'] },
        { type: 'internal-stats', stat: 'charity' },
        { type: 'internal-stats', stat: 'uptime' },
        { type: 'nintendo', stat: 'ranks' },
        { type: 'nintendo', stat: 'gear', variant: 'weapon' },
        { type: 'nintendo', stat: 'gear', variant: 'head' },
        { type: 'nintendo', stat: 'gear', variant: 'clothes' },
        { type: 'nintendo', stat: 'gear', variant: 'shoes' },
        { type: 'nintendo', stat: 'lifetimeWL' },
        { type: 'nintendo', stat: 'weaponStats', rotatingVariants: ['wins', 'ratio', 'turf'] },
        { type: 'nintendo', stat: 'weaponStats', rotatingVariants: ['losses', 'games', 'recent'] }
      ]
    }

    async nextHeadline({ newsIndex, variantIndex }) {
      const rawApiResponse = await fetch(`${'http://localhost:3000/'}${this.order[newsIndex].type}.json`)
      const apiResponse = await rawApiResponse.json()
      const entry = this.order[newsIndex]
      const { stat, rotatingVariants, variant  } = entry
      let line
      let updatedVariantIndex = variantIndex
      if (entry.rotatingVariants) {
        line = apiResponse[`output_${stat}`][rotatingVariants[variantIndex]]
        updatedVariantIndex = (variantIndex + 1) % 3
      } else if (entry.variant) {
        line = apiResponse[`output_${stat}`][variant]
      } else {
        line = apiResponse[`output_${stat}`]
      }
      const updatedNewsIndex = (newsIndex + 1) % this.order.length
      this.setState({
        categoryDisplay: entry.type,
        headlineDisplay: line,
        newsIndex: updatedNewsIndex,
        variantIndex: updatedVariantIndex
      })
      setTimeout(() => {
        this.nextHeadline({
          newsIndex: updatedNewsIndex,
          variantIndex: updatedVariantIndex,
        })
      }, 7000)
    }

    async componentDidMount() {
      await this.nextHeadline({
        newsIndex: this.state.newsIndex,
        variantIndex: this.state.variantIndex
      })
    }

    render() {
      return (
        <div className="App">
          [{this.state.categoryDisplay}] {this.state.headlineDisplay}
        </div>
      )
    }
}

import React from 'react'
import './Comp Css/ProgressBar.css'

const ProgressBar = ({completedTask,total,onCompleteList}) => {

    const percentage = total === 0 ? 0 : Math.round(((completedTask/total) * 100))

    return (
        <div className='container'>
            <div className='progress-container'>
                <div style = {onCompleteList ? {width:'100%'} : {width:`${percentage}%`}} className='filler'>
                    <span className='label'>{percentage}%</span>
                </div>
            </div>
        </div>
    )
}

export default ProgressBar

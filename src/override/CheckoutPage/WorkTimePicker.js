import React, {} from 'react';
import {gql, useQuery} from "@apollo/client";
import {rotateRight} from "../other/rotateRight";
import {DAYS_OF_WEEK} from "../other/DAYS_OF_WEEK";
import {md_hash} from "../other/md_hash";

const storeLocationConfigQuery = gql`
query{
  MpStoreLocatorConfig{
    locationsData{
        holidayData{
          from
          to
        }
      locationId
        timeData{
          from
          to
          use_system_config
          value
        }
    }
  }
}
`


const WorkTimePicker = (props) => {
    const title = props ? props.title : 'null';
    const handleChange = props ? props.handleChange : () => null;
    const value = props ? props.value : '';
    const hidden = props ? props.hidden : false;
    const locationId = props ? props.locationId : '0';
    const chosenDate = props ? props.chosenDate : null;

    const {data, loading} = useQuery(storeLocationConfigQuery, {
        fetchPolicy: 'no-cache',
        onCompleted: x => console.log(x),
        onError: x => console.log(x)
    })

    if (loading && !data) {
        return <h3>Loading</h3>
    }

    if (hidden || !data) {
        return (
            <div>
            </div>
        )
    }

    const currentTime = new Date(chosenDate)
    console.log(currentTime)

    const locationPiece = data
        ? data.MpStoreLocatorConfig.locationsData.filter(x => x.locationId.toString() === locationId.toString())
        : null

    const timeData = (locationPiece && locationPiece.length > 0) ? locationPiece[0].timeData : null

    const parsedHoliday = (((locationPiece && locationPiece.length > 0) ? locationPiece[0].holidayData : null) || []).map(x => {
        const {from, to} = x
        return {
            from: new Date(from),
            to: new Date(to)
        }
    })
    const todayTime = timeData ? timeData[currentTime.getDay()] : null

    const timeList = (currentTime ? (() => {
        if (!todayTime || todayTime.value === '0') {
            return null
        } else {
            const from = new Date(currentTime.getUTCFullYear(),
                currentTime.getUTCMonth(),
                currentTime.getUTCDay(),
                Number.parseInt(todayTime.from[0]),
                Number.parseInt(todayTime.from[1]),
                0,
                0
            )

            const to = new Date(currentTime.getUTCFullYear(),
                currentTime.getUTCMonth(),
                currentTime.getUTCDay(),
                Number.parseInt(todayTime.to[0]),
                Number.parseInt(todayTime.to[1]),
                0,
                0
            )

            if (from >= to) {
                return null
            }

            const final = []
            let i = 0
            let intermediateDate = from;

            let startTime = from.getHours()
            let endTime = startTime + 1

            for (let i = 0; startTime + i < to.getHours() && i < 30; i++) {
                // console.log(intermediateDate)
                // let str = ''
                // str = str + intermediateDate.getHours() + ':' + intermediateDate.getMinutes() + ' - '
                // intermediateDate.setHours(intermediateDate.getHours() + (60 * 60 * 1000))
                // str = str + intermediateDate.getHours() + ':' + intermediateDate.getMinutes()
                // final.push(str)
                // final.push(intermediateDate.toString())
                endTime = startTime + i + 1;
                if (endTime <= to.getHours()) {
                    final.push(((startTime + i).toString().padStart(2, '0') + ':' + from.getMinutes().toString().padStart(2, '0')
                        + ' - ' + endTime.toString().padStart(2, '0') + ':' + from.getMinutes().toString().padStart(2, '0')))
                }
            }
            return final
        }
    })() : null) || []

    const thisWeekTime = timeData ? (
        rotateRight(timeData).map((x, index) => {
            const expectedDate = {
                day: DAYS_OF_WEEK[index],
                from: new Date(currentTime.getUTCFullYear(),
                    currentTime.getUTCMonth(),
                    currentTime.getUTCDay(),
                    Number.parseInt(x.from[0]),
                    Number.parseInt(x.from[1]),
                    0,
                    0
                ),
                to: new Date(currentTime.getUTCFullYear(),
                    currentTime.getUTCMonth(),
                    currentTime.getUTCDay(),
                    Number.parseInt(x.to[0]),
                    Number.parseInt(x.to[1]),
                    0,
                    0
                ),
                isWork: x.value === '1',
                isHoliday: false
            }

            const validity = parsedHoliday.reduce((prevValidity, holiday) => {
                if (
                    (holiday.from <= expectedDate.from && holiday.to > expectedDate.from)
                    || (holiday.from <= expectedDate.to && holiday.to > expectedDate.to)
                ) {
                    return false
                }
                return prevValidity;
            }, true)

            if (validity) {
                return expectedDate
            } else {
                return Object.assign(expectedDate, {isHoliday: true})
            }
        })
    ) : []


    const mainInput = (
        <select style={{
            fontSize: 18,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            paddingBottom: 5
        }}
                onChange={e => {
                    console.log('x')
                    console.log(e.target.value)
                    handleChange(e.target.value)
                }}
                value={value}
        >
            {timeList.map((x, index) => {
                return <option key={md_hash(x)} value={x} selected={index === 0}>{x}</option>
            })}
        </select>
    )

    return (
        <div style={{display: 'flex', flexDirection: "column", marginBottom: 7}}>
            <label style={{fontSize: 20, marginBottom: 5}}>
                {title}
                <span style={{color: "#c15050"}}>  *</span>

            </label>
            {mainInput}
        </div>
    );
};

export default WorkTimePicker;

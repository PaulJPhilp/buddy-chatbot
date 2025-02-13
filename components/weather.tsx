'use client';

import cx from 'classnames';
import { format, isWithinInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import type { WeatherAtLocation, DailyWeatherRecord } from '@/lib/types';
import { ExtendableDrawer } from '@/components/ui/extendable-drawer';
import React from 'react';
import DataTable from './ui/data-table';
import { columns } from './weather-columns';
import moment from 'moment';

function n(num: number): number {
  return Math.ceil(num);
}

const Weather: React.FC<{weatherAtLocation?: WeatherAtLocation }> = ({weatherAtLocation }: {weatherAtLocation?: WeatherAtLocation })  => {
  //console.log(`weatherAtLocation: ${JSON.stringify(weatherAtLocation, null, 2)}`);
  const currentHigh = weatherAtLocation? Math.max(
    ...weatherAtLocation.hourly.temperature.slice(0, 24),
  ): 0;
  const currentLow = weatherAtLocation? Math.min(
    ...weatherAtLocation.hourly.temperature.slice(0, 24),
  ): 0;

  const isDay = weatherAtLocation? isWithinInterval(
    new Date(weatherAtLocation.current.time),
    {
      start: new Date(weatherAtLocation.daily.sunrise[0]),
      end: new Date(weatherAtLocation.daily.sunset[0]),
    },
  ): false;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 6;

  // Find the index of the current time or the next closest time
  const currentTimeIndex = weatherAtLocation? weatherAtLocation.hourly.time.findIndex(
    (time) => new Date(time) >= new Date(weatherAtLocation.current.time),
  ): 0;

  // Slice the arrays to get the desired number of items
  const displayTimes = weatherAtLocation? weatherAtLocation.hourly.time.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  ): [];
  const displayTemperatures = weatherAtLocation? weatherAtLocation.hourly.temperature.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  ): [];

  return (
    <div
      className={cx(
        'flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px]',
        {
          'bg-blue-400': isDay,
        },
        {
          'bg-indigo-900': !isDay,
        },
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div
            className={cx(
              'size-10 rounded-full skeleton-div',
              {
                'bg-yellow-300': isDay,
              },
              {
                'bg-indigo-100': !isDay,
              },
            )}
          />
          <div className="text-4xl font-medium text-blue-50">
            {n(weatherAtLocation? weatherAtLocation.current.temperature: 0)}
            {weatherAtLocation ? weatherAtLocation.current_units.temperature: ''}
          </div>
        </div>

        <div className="text-blue-50">{`H:${n(currentHigh)}° L:${n(currentLow)}°`}</div>
      </div>

      <div className="flex flex-row justify-between">
        {displayTimes.map((time, index) => (
          <div key={time} className="flex flex-col items-center gap-1">
            <div className="text-blue-100 text-xs">
              {format(new Date(time), 'ha')}
            </div>
            <div
              className={cx(
                'size-6 rounded-full skeleton-div',
                {
                  'bg-yellow-300': isDay,
                },
                {
                  'bg-indigo-200': !isDay,
                },
              )}
            />
            <div className="text-blue-50 text-sm">
              {n(displayTemperatures[index])}
              {weatherAtLocation ? weatherAtLocation.hourly_units.temperature: 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EmptyWeather = () => {
  return <>No weather data</>;
}

const createParentComponent = (weatherAtLocation?: WeatherAtLocation) =>  {
  if (!weatherAtLocation) return Weather
  return React.memo(({ isDrawerOpen }: { isDrawerOpen: boolean }) => {
    return <Weather weatherAtLocation={weatherAtLocation} />
  })  
} 


export type DailyWeather = { date: string; sunrise: string; sunset: string; temperatures: DailyWeatherRecord; min: number; max: number; pressure: number; humidity: number; clouds: number; wind_speed: number; wind_deg: number }

// Example drawer component with DataTable
const DrawerContent: React.FC<{ isDrawerOpen: boolean, dailyData: DailyWeather[]}> = ({ isDrawerOpen, dailyData }) => (
  <>
  <div className="p-6">
    <h4 className="font-semibold mb-4">Daily Weather</h4>
    <DataTable columns={columns} data={dailyData} />
  </div>
  </>
)

const formatDatailiesData = (weatherAtLocation: WeatherAtLocation): DailyWeather[] =>  {
  moment.locale('en_US');
  //console.log(weatherAtLocation)
  const daily = weatherAtLocation.daily;
  const dailies: DailyWeather[] = []
  for (let d = 0; d < daily.time.length; d++) {
    const day: DailyWeather = {
      date: moment(daily.time[d]).format('dddd'), //daily.time[d],
      sunrise: moment(daily.sunrise[d]).format('h:mm A'),
      sunset: moment(daily.sunset[d]).format('h:mm A'),
      temperatures: daily.temperatures[d],
      min: daily.temperatures[d].min,
      max: daily.temperatures[d].max,
      pressure: daily.pressure[d],
      humidity: daily.humidity[d],
      clouds: daily.clouds[d],
      wind_speed: daily.wind_speed[d],
      wind_deg: daily.wind_deg[d],
    }
    dailies.push(day)
  }
  //console.log(dailies)
  return dailies  
}

const createDrawerComponent = (weatherAtLocation?: WeatherAtLocation): React.ComponentType<{ isDrawerOpen: boolean }> =>  {
  if (!weatherAtLocation) return EmptyWeather
  return React.memo(({ isDrawerOpen }: { isDrawerOpen: boolean }) => {
    return <DrawerContent isDrawerOpen={isDrawerOpen} dailyData={formatDatailiesData(weatherAtLocation)} />
  })  
}

export const ExtendableWeather = ({ weatherAtLocation }: { weatherAtLocation?: WeatherAtLocation }) => {
  const ParentComponent = createParentComponent(weatherAtLocation);
  const DrawerComponent = createDrawerComponent(weatherAtLocation);
  return (
    <ExtendableDrawer 
      parentComponent={ParentComponent} 
      drawerComponent={DrawerComponent}
    >
    </ExtendableDrawer>
  )
}
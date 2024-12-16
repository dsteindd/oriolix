import React from 'react';
import './select-list.css'

interface SelectListProps<T> {
    items: T[]
    onSelect: (item?: T) => void,
    renderChild: (item?: T) => React.ReactNode,
}


export const SelectList:
    <T extends {}>(
        p: SelectListProps<T>
    ) => React.ReactElement
    = <T extends {}>({
                         onSelect,
                         items,
                         renderChild

                     }: SelectListProps<T>) => {
    
    console.log(items)
    
    return (
        <div className='scroller'>
            <div className='scrollList'>
                <div key="None" onClick={(_) => {
                    onSelect(undefined);
                }}>
                    {renderChild(undefined)}
                </div>
                {items.map(item => (
                    <div key={item?.toString()} onClick={(e) => {
                        onSelect(item)
                    }}>
                        {renderChild(item)}
                    </div>
                ))}
            </div>
        </div>
    );
}
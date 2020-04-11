import React from 'react'
import Identify from 'src/simi/Helper/Identify';
require('./page404.scss')
const Page404 = () => {
    return (
        <div className="page-404 text-center">
            <p className="title-1">{Identify.__('404')}</p>
            <p className="title-2">{Identify.__('Page not found')}</p>
            <p className="title-3">
                {Identify.__('The resource requested could not be found on this server!')}
            </p>
        </div>
    )
}

export default Page404
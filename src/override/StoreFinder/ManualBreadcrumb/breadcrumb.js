import React, {} from "react";
import {Link} from "@magento/venia-ui/lib/drivers";
import {FormattedMessage} from "react-intl";
import {mergeClasses} from "@magento/venia-ui/lib/classify";
import defaultClasses from "@magento/venia-ui/lib/components/Breadcrumbs/breadcrumbs.css";

const DELIMITER = '/';

export const ManualStoreLocatorBreadcrumb = (props) => {
    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div className={classes.root}>
            <Link className={classes.link} to="/" style={{color: '#006bb4'}}>
                <FormattedMessage id={'global.home'} defaultMessage={'Home'}/>
            </Link>
            <span className={classes.divider}>{DELIMITER}</span>
            <FormattedMessage id={'Store Locator'} defaultMessage={'Store Locator'}/>
        </div>
    )
}

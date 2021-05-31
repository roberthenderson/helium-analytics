import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const NavLink = ({ children, href }) => {
    const child = React.Children.only(children);
    const router = useRouter();
    const applyValueToActive = (value, inactiveValue) => {
        return router.pathname === href ? value : inactiveValue;
    };

    return (
        <Link href={href}>
            {React.cloneElement(child, {
                "aria-current": applyValueToActive("page", null),
                className: applyValueToActive(
                    "bg-indigo-700 text-white rounded-md py-2 px-3 text-sm font-medium",
                    "text-white hover:bg-indigo-500 hover:bg-opacity-75 rounded-md py-2 px-3 text-sm font-medium"
                ),
            })}
        </Link>
    );
};

export default NavLink;

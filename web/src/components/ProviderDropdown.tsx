import React, {memo} from "react";
import {FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import {ProvidersResponse} from "../types/providerTypes.ts";

interface ProviderDropdownProps {
    providers: ProvidersResponse[],
    selectedProvider: string,
    setSelectedProvider: React.Dispatch<React.SetStateAction<string>>,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    defaultValue: string
}

const ProviderDropdown = memo(function ProviderDropdown({ providers, selectedProvider, setSelectedProvider, setPage, defaultValue }: ProviderDropdownProps) {

    return (
        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Provider</InputLabel>
            <Select
                color="secondary"
                value={selectedProvider}
                onChange={(e) => {
                    setPage(0);
                    setSelectedProvider(e.target.value);
                }}
                label="Filter by Provider"
            >
                <MenuItem key={defaultValue} value={defaultValue}>{defaultValue}</MenuItem>
                {providers.map((provider) => (
                    <MenuItem key={provider.name} value={provider.name}>
                        {provider.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});

export default ProviderDropdown;

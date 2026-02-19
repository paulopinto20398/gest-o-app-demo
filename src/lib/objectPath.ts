// src/lib/objectPath.ts

export function setByPath<T extends Record<string, any>>(
    obj: T,
    path: string,
    value: any
): T {
    const parts = path.split(".");
    const clone: any = structuredClone(obj);

    let curr = clone;

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];

        // garante que o objeto intermédio existe
        curr[key] = curr[key] ?? {};
        curr = curr[key];
    }

    curr[parts[parts.length - 1]] = value;

    return clone;
}

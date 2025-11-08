# 0.2
## 0.2.0
**Breaking Changes**
- Rename the class to Orcid.
- Remove getOrcidId. Use direct access to the orcidId instead.
- Migrate constants, such as `WORK_TYPES`, to a separate module, `constants`.
- `Orcid.fetchWorks(putCodes?: number | number[] | string | string[] | null): Promise<Work[]>`
- Change the static functions in `Orcid` to method, so the `works` argument is automatically passed.
- Rename `getStatistics` to `getStats`.
- Rename `WorksStatistics` to `OrcidStats`.

**Improvements**
- Improve documentation and host it on github.io.
- Improve installation instruction in README.
- Reduce package size.
- `sortByDate` now sort using publication date instead of year.

**New Features**
- `Orcid.getWorks()`: Get the works associated with the ORCID ID. Fetch the works if not cached. 
- `AnyWork` type: A unified type of `Work` and `WorkSummary`.
- `WORK_TYPES`: Include all work types supported by ORCID API.

# 0.1
## 0.1.5
- Increase entry point compatibility.

## 0.1.4
- Fix entry point.

## 0.1.3
- Reduce package size.

## 0.1.2
- Add bundled version.

## 0.1.1
- Add minified package.
- Fix CI.

## 0.1.0
- First release

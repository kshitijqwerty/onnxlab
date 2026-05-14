export async function runInference(
  session: any,
  inputName: string,
  tensor: any,
) {
  const feeds = {
    [inputName]: tensor,
  };

  const results = await session.run(feeds);

  return results;
}

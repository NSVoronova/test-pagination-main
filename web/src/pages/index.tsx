import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", {method: 'GET'})
    if (!res.ok) {
      return {props: {statusCode: res.status, users: []}}
    }

    return {
      props: {statusCode: 200, users: await res.json()}
    }
  } catch (e) {
    return {props: {statusCode: 500, users: []}}
  }
}) satisfies GetServerSideProps<TGetServerSideProps>

export default function Home({ statusCode, users }: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;
  const pageCount = Math.ceil(users.length / pageSize); // Calculate total pages
  
  const handleFirstPageClick = () => setCurrentPage(1);
  const handlePrevPageClick = () => setCurrentPage(currentPage - 1);
  const handlePageClick = (page: number) => setCurrentPage(page);
  const handleNextPageClick = () => setCurrentPage(currentPage + 1);
  const handleLastPageClick = () => setCurrentPage(pageCount);
  
  const pages: number[] = Array.from({ length: pageCount }, (_, index) => index + 1);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = currentPage * pageSize;
  const currentUsers = users.slice(startIndex, endIndex);
  
  function getRanges(pages: number[]) {
    const ranges = [];
    for (let i = 0; i < pages.length; i += 10) {
      const range = pages.slice(i, i + 10);
      ranges.push(range);
    }
    return ranges;
  }
  const ranges = getRanges(pages);
  const initialRange = ranges[0];
  const [currentRange, setCurrentRange] = useState(initialRange);
  
  useEffect(() => {
    const newRange = ranges.find((range) => range.includes(currentPage));
    setCurrentRange(newRange || []);
  }, [currentPage]);
  
  if (statusCode !== 200) {
  return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
}
  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="pagination-container">
            <Pagination.First onClick={handleFirstPageClick} disabled={currentPage === 1}></Pagination.First>
            <Pagination.Prev onClick={handlePrevPageClick} disabled={currentPage === 1}></Pagination.Prev>
            {currentRange.map(page => (
              <Pagination.Item key={page} onClick={() => handlePageClick(page)} active={currentPage === page}>{page}</Pagination.Item>
            ))}
            <Pagination.Next onClick={handleNextPageClick} disabled={currentPage === pageCount}></Pagination.Next>
            <Pagination.Last onClick={handleLastPageClick} disabled={currentPage === pageCount}></Pagination.Last>
          </Pagination>
        </Container>
      </main>
    </>
  );
}

